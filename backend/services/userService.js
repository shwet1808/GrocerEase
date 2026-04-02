// ============================================================================
// USER SERVICE — backend/services/userService.js
// ============================================================================
//
// This service handles business logic related to user management.
// Currently, it provides admin-only functionality to view all registered users.
//
// SECURITY NOTE:
//   When fetching user data, we NEVER include the password field in the results.
//   Even though passwords are hashed (scrambled), exposing hashes is still a
//   security risk — attackers could use them in "offline brute-force" attacks.
// ============================================================================

const db = require('../config/db');

// ============================================================================
// FETCH ALL USERS
// ============================================================================
// Retrieves all registered users with their details (excluding passwords).
// Also calculates summary metrics (total customers vs total admins)
// for the admin panel's CRM (Customer Relationship Management) header.
//
// Returns: {
//   metrics: { totalCustomers: <number>, totalAdmins: <number> },
//   users:   [{ id, name, email, role, joined_date }, ...]
// }
// ============================================================================
const fetchAllUsers = async () => {

  // --- Fetch all users, explicitly selecting only safe columns ---
  // We list each column individually instead of using SELECT * to ensure
  // the password column is NEVER included in the response.
  //
  // DATE_FORMAT: Converts the raw timestamp (e.g., "2026-03-15 14:30:00")
  // into a human-readable format (e.g., "Mar 15, 2026") for the frontend.
  const [users] = await db.query(`
    SELECT
      id,
      name,
      email,
      role,
      DATE_FORMAT(created_at, '%b %d, %Y') as joined_date
    FROM users
    ORDER BY created_at DESC
  `);

  // --- Calculate quick summary stats for the CRM dashboard header ---
  // Array.filter() creates a new array with only the elements that pass the test.
  // .length then gives us the count of those filtered elements.
  const totalCustomers = users.filter(u => u.role === 'customer').length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;

  return {
    metrics: { totalCustomers, totalAdmins },
    users
  };
};


// ============================================================================
// EXPORTS
// ============================================================================
module.exports = {
  fetchAllUsers
};
