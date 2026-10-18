const test = require("node:test");
const assert = require("node:assert/strict");
const adminMiddleware = require("../middleware/adminMiddleware");

test("RBAC Security: super_admin has unconditional root bypass", () => {
  const guard = adminMiddleware.requireRole(["delivery_coordinator"], ["/delivery-fleet"]);

  const req = {
    user: {
      role: "super_admin",
      permissions: ["*"],
    },
  };
  let passed = false;
  const res = {
    status: () => {
      throw new Error("Should not be called");
    },
  };
  guard(req, res, () => {
    passed = true;
  });

  assert.equal(passed, true, "super_admin should pass unconditionally");
});

test("RBAC Security: staff member is strictly restricted to allotted screens", () => {
  const allowedGuard = adminMiddleware.requireRole(
    ["super_admin", "admin", "kitchen_manager"],
    ["/products"]
  );
  const forbiddenGuard = adminMiddleware.requireRole(
    ["super_admin", "admin"],
    ["/audit-logs"]
  );

  const staffReq = {
    user: {
      role: "kitchen_manager",
      permissions: ["/products", "/category"],
    },
  };

  let allowed = false;
  allowedGuard(staffReq, {}, () => {
    allowed = true;
  });
  assert.equal(allowed, true, "Staff should access /products because it is allotted");

  let forbiddenStatus = 0;
  let forbiddenMessage = "";
  const forbiddenRes = {
    status: (code) => {
      forbiddenStatus = code;
      return {
        json: (body) => {
          forbiddenMessage = body.message;
        },
      };
    },
  };

  forbiddenGuard(staffReq, forbiddenRes, () => {
    assert.fail("Staff should NOT be allowed on /audit-logs");
  });

  assert.equal(forbiddenStatus, 403);
  assert.match(forbiddenMessage, /Access denied/i);
});

test("RBAC Security: staff member cannot bypass with wildcard * in permissions", () => {
  const guard = adminMiddleware.requireRole(
    ["super_admin"],
    ["/admins"]
  );

  const hackerStaffReq = {
    user: {
      role: "support_agent",
      permissions: ["*"], // Attempted bypass
    },
  };

  let forbiddenStatus = 0;
  const res = {
    status: (code) => {
      forbiddenStatus = code;
      return {
        json: () => {},
      };
    },
  };

  guard(hackerStaffReq, res, () => {
    assert.fail("Non-super_admin with wildcard * must NOT bypass checks");
  });

  assert.equal(forbiddenStatus, 403);
});

test("RBAC Security: staff with empty permissions array cannot access any guarded screen", () => {
  const guard = adminMiddleware.requireRole(
    ["super_admin", "admin", "support_agent"],
    ["/leads"]
  );

  const noPermsStaff = {
    user: {
      role: "support_agent",
      permissions: [], // No screens allotted by super admin
    },
  };

  let forbiddenStatus = 0;
  const res = {
    status: (code) => {
      forbiddenStatus = code;
      return {
        json: () => {},
      };
    },
  };

  guard(noPermsStaff, res, () => {
    assert.fail("Staff with 0 allotted screens must be blocked");
  });

  assert.equal(forbiddenStatus, 403);
});
