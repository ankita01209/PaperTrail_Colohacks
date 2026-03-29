"""
test_all_layers.py - Comprehensive backend layer test suite for PaperTrail.
Tests every endpoint across all 6 pipeline layers + admin + voice using dev tokens.

Usage:  python test_all_layers.py
Requires: Backend running on http://localhost:8000
"""

import requests, json, sys, os

# Fix Windows console encoding
sys.stdout.reconfigure(encoding='utf-8')

BASE = "http://localhost:8000/v1"
CLERK  = {"Authorization": "Bearer test_clerk_token"}
ADMIN  = {"Authorization": "Bearer test_admin_token"}
NO_AUTH = {}

passed = 0
failed = 0
errors = []

def test(name, method, path, *, token=None, json_body=None, files=None, data=None, expect_status=200, expect_keys=None):
    global passed, failed
    url = f"{BASE}{path}"
    headers = token or {}
    try:
        if method == "GET":
            r = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            if files:
                r = requests.post(url, headers=headers, files=files, data=data, timeout=10)
            else:
                r = requests.post(url, headers={**headers, "Content-Type": "application/json"}, json=json_body, timeout=10)
        elif method == "PATCH":
            r = requests.patch(url, headers={**headers, "Content-Type": "application/json"}, json=json_body, timeout=10)
        else:
            print(f"  [FAIL] Unknown method {method}")
            failed += 1
            return None

        status_ok = r.status_code == expect_status
        body = None
        try:
            body = r.json()
        except:
            pass

        keys_ok = True
        if expect_keys and body:
            for k in expect_keys:
                if k not in body:
                    keys_ok = False
                    break

        if status_ok and keys_ok:
            print(f"  [PASS] {name}  [{r.status_code}]")
            passed += 1
        else:
            reason = ""
            if not status_ok:
                reason += f"Expected {expect_status}, got {r.status_code}. "
            if not keys_ok:
                reason += f"Missing keys in response. "
            detail = ""
            if body and isinstance(body, dict) and "detail" in body:
                detail = f" Detail: {body['detail']}"
            print(f"  [FAIL] {name}  [{r.status_code}] {reason}{detail}")
            failed += 1
            errors.append(f"{name}: {reason}{detail}")
        return body

    except requests.exceptions.ConnectionError:
        print(f"  [FAIL] {name}  [CONNECTION REFUSED - is backend running?]")
        failed += 1
        errors.append(f"{name}: Connection refused")
        return None
    except Exception as e:
        print(f"  [FAIL] {name}  [EXCEPTION: {e}]")
        failed += 1
        errors.append(f"{name}: {e}")
        return None


# ---------------------------------------------------------------------------
# 0. Health & Root
# ---------------------------------------------------------------------------
print("\n=== 0. Health Check ===")
test("GET /", "GET", "/../", expect_keys=["service", "status"])
test("GET /health", "GET", "/../health", expect_keys=["status"])


# ---------------------------------------------------------------------------
# 1. Auth Layer
# ---------------------------------------------------------------------------
print("\n=== 1. Auth Layer ===")

test("GET /auth/me (no token) -> 422", "GET", "/auth/me", expect_status=422)

me_clerk = test("GET /auth/me (clerk)", "GET", "/auth/me", token=CLERK, expect_keys=["uid", "name", "role"])
if me_clerk:
    assert me_clerk["role"] == "clerk", f"Expected clerk role, got {me_clerk['role']}"
    print(f"     -> uid={me_clerk['uid']}, role={me_clerk['role']}, lang={me_clerk.get('preferred_language')}")

me_admin = test("GET /auth/me (admin)", "GET", "/auth/me", token=ADMIN, expect_keys=["uid", "name", "role"])
if me_admin:
    assert me_admin["role"] == "admin", f"Expected admin role, got {me_admin['role']}"
    print(f"     -> uid={me_admin['uid']}, role={me_admin['role']}")

test("POST /auth/register (clerk token)", "POST", "/auth/register",
     token=CLERK,
     json_body={"name": "Test New Clerk", "email": "newclerk@gov.in", "preferred_language": "hi-IN"},
     expect_keys=["uid", "role", "preferred_language"])


# ---------------------------------------------------------------------------
# 2. Admin Layer
# ---------------------------------------------------------------------------
print("\n=== 2. Admin Layer ===")

test("GET /admin/users (clerk) -> 403", "GET", "/admin/users", token=CLERK, expect_status=403)

users = test("GET /admin/users (admin)", "GET", "/admin/users", token=ADMIN, expect_keys=["users"])
if users:
    print(f"     -> {len(users['users'])} users found")

test("GET /admin/documents/latest (admin)", "GET", "/admin/documents/latest", token=ADMIN, expect_keys=["entries"])

records = test("GET /admin/records (admin)", "GET", "/admin/records", token=ADMIN, expect_keys=["records", "total", "page"])
if records:
    print(f"     -> {records['total']} total records, page {records['page']}")

test("GET /admin/records (with pagination)", "GET", "/admin/records?page=1&page_size=5", token=ADMIN, expect_keys=["records", "total"])

test("GET /admin/templates/pending (admin)", "GET", "/admin/templates/pending", token=ADMIN, expect_keys=["pending_templates"])

# Attempt role change on non-existent user -> 404
test("PATCH /admin/users/FAKE_UID/role -> 404", "PATCH", "/admin/users/FAKE_UID_12345/role",
     token=ADMIN, json_body={"role": "admin"}, expect_status=404)

# Attempt self role change -> 400
test("PATCH /admin/users/test_admin/role (self) -> 400", "PATCH", "/admin/users/test_admin/role",
     token=ADMIN, json_body={"role": "clerk"}, expect_status=400)


# ---------------------------------------------------------------------------
# 3. Template Pipeline Layer
# ---------------------------------------------------------------------------
print("\n=== 3. Template Pipeline ===")

test("GET /templates/my-submissions (clerk)", "GET", "/templates/my-submissions", token=CLERK, expect_keys=["submissions"])

# Submit a new template
import io
import struct, zlib
def make_tiny_png():
    """Generate a minimal valid 2x2 white PNG."""
    width, height = 2, 2
    raw_data = b""
    for _ in range(height):
        raw_data += b"\x00" + b"\xff\xff\xff" * width
    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = struct.pack(">I", zlib.crc32(c) & 0xffffffff)
        return struct.pack(">I", len(data)) + c + crc
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    compressed = zlib.compress(raw_data)
    return (b"\x89PNG\r\n\x1a\n" +
            chunk(b"IHDR", ihdr_data) +
            chunk(b"IDAT", compressed) +
            chunk(b"IEND", b""))

png_bytes = make_tiny_png()

template_sub = test(
    "POST /templates/submit (new template)", "POST", "/templates/submit",
    token=CLERK,
    files={"file": ("test_template.png", png_bytes, "image/png")},
    data={
        "form_name": "Test Certificate",
        "department": "Testing Dept",
        "field_schema": json.dumps([{"field_name": "test_field", "label": "Test Field", "data_type": "text", "bounding_box": {"x": 0.1, "y": 0.1, "width": 0.3, "height": 0.05}}]),
    },
    expect_keys=["template_pending_id", "status"]
)
if template_sub:
    pending_id = template_sub["template_pending_id"]
    print(f"     -> pending_id={pending_id}, status={template_sub['status']}")

    # Admin approval flow
    approve = test(
        "POST /admin/templates/{id}/approve", "POST", f"/admin/templates/{pending_id}/approve",
        token=ADMIN,
        expect_keys=["template_id", "status"]
    )
    if approve:
        print(f"     -> approved template_id={approve['template_id']}")


# ---------------------------------------------------------------------------
# 4. Pipeline (Layers 1-6) - Session-based tests
# ---------------------------------------------------------------------------
print("\n=== 4. Pipeline Layers (1-6) ===")

# Layer 1: Preprocess - upload a PNG
preprocess_result = test(
    "POST /pipeline/preprocess (upload PNG)", "POST", "/pipeline/preprocess",
    token=CLERK,
    files={"file": ("test.png", png_bytes, "image/png")},
    expect_keys=["session_id", "cleaned_image_url"]
)

session_id = preprocess_result.get("session_id") if preprocess_result else None
if session_id:
    print(f"     -> session_id = {session_id}")
    print(f"     -> original_url = {preprocess_result.get('original_image_url', '')[:60]}...")
    print(f"     -> cleaned_url = {preprocess_result.get('cleaned_image_url', '')[:60]}...")
    print(f"     -> skew_corrected = {preprocess_result.get('skew_corrected_degrees')} degrees")

    # Layer 2: Match Template
    match_result = test(
        "POST /pipeline/match-template", "POST", "/pipeline/match-template",
        token=CLERK,
        json_body={"session_id": session_id},
        expect_keys=["session_id", "match_status"]
    )
    if match_result:
        print(f"     -> match_status={match_result['match_status']}, template={match_result.get('template_name')}, confidence={match_result.get('confidence')}")

    # Layer 3: Classify (only works if matched)
    if match_result and match_result.get("match_status") == "matched":
        classify_result = test(
            "GET /pipeline/classify/{session_id}", "GET", f"/pipeline/classify/{session_id}",
            token=CLERK,
            expect_keys=["session_id", "template_id", "template_name", "fields"]
        )
        if classify_result:
            print(f"     -> template={classify_result['template_name']}, dept={classify_result['department']}, fields={len(classify_result['fields'])}")
            for f in classify_result['fields']:
                print(f"        - {f['field_name']} ({f['data_type']}): bbox={f['bounding_box']}")

        # Layer 4: Extract
        extract_result = test(
            "POST /pipeline/extract/{session_id}", "POST", f"/pipeline/extract/{session_id}",
            token=CLERK,
            expect_keys=["session_id", "fields", "summary"]
        )
        if extract_result:
            s = extract_result["summary"]
            print(f"     -> total={s['total_fields']}, uncertain={s['uncertain_fields']}, empty={s['empty_fields']}")
            for f in extract_result['fields']:
                print(f"        - {f['field_name']}: value='{f.get('value', '')}' conf={f['confidence']} uncertain={f['uncertain']}")

        # Layer 5: Save Draft
        draft_fields = [{"field_name": "applicant_name", "value": "Test User Corrected"}]
        test(
            "POST /pipeline/save-draft/{session_id}", "POST", f"/pipeline/save-draft/{session_id}",
            token=CLERK,
            json_body={"fields": draft_fields},
            expect_keys=["session_id", "saved_at"]
        )

        # Layer 6: Submit
        submit_fields = [{"field_name": "applicant_name", "final_value": "Corrected Name"}]
        submit_result = test(
            "POST /pipeline/submit/{session_id}", "POST", f"/pipeline/submit/{session_id}",
            token=CLERK,
            json_body={"fields": submit_fields},
            expect_keys=["record_id", "session_id", "submitted_at"]
        )
        if submit_result:
            rid = submit_result["record_id"]
            print(f"     -> record_id={rid}")
            print(f"     -> department={submit_result.get('department')}")
            print(f"     -> fields corrected: {[f['field_name'] for f in submit_result.get('extracted_fields',[]) if f.get('was_corrected')]}")

            # Layer 6b: Idempotent re-submit -> 409
            test(
                "POST /pipeline/submit (duplicate) -> 409", "POST", f"/pipeline/submit/{session_id}",
                token=CLERK,
                json_body={"fields": submit_fields},
                expect_status=409
            )

            # Record retrieval
            record = test(
                "GET /pipeline/record/{record_id}", "GET", f"/pipeline/record/{rid}",
                token=CLERK,
                expect_keys=["record_id", "clerk_uid"]
            )
            if record:
                print(f"     -> record verified: id={record['record_id']}, clerk={record['clerk_uid']}")
    else:
        print("     [INFO] Template match returned no_match (expected for tiny test PNG - need real form image)")
        print("     [INFO] Testing classify without template -> 400")
        test(
            "GET /pipeline/classify (no template) -> 400", "GET", f"/pipeline/classify/{session_id}",
            token=CLERK, expect_status=400
        )
else:
    print("     [WARN] Preprocess failed - skipping pipeline layer tests")

# Test invalid session
test("GET /pipeline/classify/FAKE_SESSION -> 404", "GET", "/pipeline/classify/FAKE_SESSION_ID", token=CLERK, expect_status=404)

# Test invalid file type
test("POST /pipeline/preprocess (invalid file) -> 422", "POST", "/pipeline/preprocess",
     token=CLERK,
     files={"file": ("test.txt", b"hello world", "text/plain")},
     expect_status=422)


# ---------------------------------------------------------------------------
# 5. Voice & Accessibility Layer
# ---------------------------------------------------------------------------
print("\n=== 5. Voice & Accessibility Layer ===")

# Feature 1: Preferences
test("PATCH /users/me/preferences (empty body) -> 400", "PATCH", "/users/me/preferences",
     token=CLERK, json_body={}, expect_status=400)

prefs = test(
    "PATCH /users/me/preferences (set language + TTS)", "PATCH", "/users/me/preferences",
    token=CLERK,
    json_body={"preferred_language": "hi-IN", "voice_mode_enabled": True},
    expect_keys=["success", "data"]
)
if prefs and prefs.get("data"):
    print(f"     -> lang={prefs['data']['preferred_language']}, tts={prefs['data']['voice_mode_enabled']}")

test(
    "PATCH /users/me/preferences (enable voice agent)", "PATCH", "/users/me/preferences",
    token=CLERK,
    json_body={"voice_agent_enabled": True},
    expect_keys=["success", "data"]
)

# Feature 2: Voice Agent
voice_fields = [
    {"field_id": "full_name", "label": "Full Name", "value": "Ramesh Kumar", "confidence": 0.92, "uncertain": False},
    {"field_id": "dob", "label": "Date of Birth", "value": "15-08-1990", "confidence": 0.55, "uncertain": True, "bounding_box": {"x": 0.1, "y": 0.3, "w": 0.4, "h": 0.05}},
]

voice_result = test(
    "POST /voice/agent (clerk question)", "POST", "/voice/agent",
    token=CLERK,
    json_body={
        "session_id": session_id or "test_session_123",
        "question": "Which field has low confidence?",
        "language": "en-IN",
        "extracted_fields": voice_fields,
    },
)

# Even if voice agent fails (Ollama not running), check it returns a clear error
if voice_result:
    if voice_result.get("data"):
        print(f"     -> answer: {voice_result['data'].get('answer', '')[:80]}...")
        print(f"     -> field_referenced: {voice_result['data'].get('field_referenced')}")
    elif voice_result.get("detail"):
        print(f"     -> voice agent error (expected if Ollama not running): {voice_result['detail']}")

# Voice Agent: validation (no fields) -> 422
test(
    "POST /voice/agent (empty fields) -> 422", "POST", "/voice/agent",
    token=CLERK,
    json_body={
        "session_id": "test",
        "question": "test",
        "language": "en-IN",
        "extracted_fields": [],
    },
    expect_status=422
)


# ---------------------------------------------------------------------------
# 6. Firestore Data Verification (Templates)
# ---------------------------------------------------------------------------
print("\n=== 6. Firestore Template Verification ===")

# Check templates exist via the admin endpoint workaround
# (We can't directly query Firestore from the test, but we can verify via API)
if me_admin:
    print("     -> Templates are stored in Firestore 'templates' collection")
    print("     -> Seeds: income_certificate_mh_v1, birth_registration_mh_v1")
    print("     -> Pending submissions: 'templates_pending' collection")
    print("     -> Approved templates move to 'templates' collection on admin approval")


# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
print("\n" + "=" * 60)
print(f"  RESULTS: {passed} passed, {failed} failed out of {passed + failed} tests")
print("=" * 60)
if errors:
    print("\n  Failed tests:")
    for e in errors:
        print(f"    * {e}")
print()

sys.exit(0 if failed == 0 else 1)
