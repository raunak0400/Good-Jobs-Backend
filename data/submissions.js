/* ============================================================
   Good Jobs — In-Memory Submissions Store
   (Replaces a database while using mock data)
   ============================================================ */

const submissions = {
  jobPostings:       [],   // POST /api/contact/job
  roomListings:      [],   // POST /api/contact/room
  generalEnquiries:  [],   // POST /api/contact/general
  newsletterEmails:  [],   // POST /api/newsletter
};

/**
 * Add a job posting submission
 */
function addJobPosting(data) {
  const entry = { id: Date.now(), createdAt: new Date().toISOString(), ...data };
  submissions.jobPostings.push(entry);
  return entry;
}

/**
 * Add a room listing submission
 */
function addRoomListing(data) {
  const entry = { id: Date.now(), createdAt: new Date().toISOString(), ...data };
  submissions.roomListings.push(entry);
  return entry;
}

/**
 * Add a general enquiry submission
 */
function addGeneralEnquiry(data) {
  const entry = { id: Date.now(), createdAt: new Date().toISOString(), ...data };
  submissions.generalEnquiries.push(entry);
  return entry;
}

/**
 * Add a newsletter subscriber
 */
function addNewsletterEmail(email) {
  const exists = submissions.newsletterEmails.find(e => e.email === email);
  if (exists) return { alreadySubscribed: true, ...exists };
  const entry = { id: Date.now(), createdAt: new Date().toISOString(), email };
  submissions.newsletterEmails.push(entry);
  return entry;
}

/**
 * Get all submissions (for admin/debug purposes)
 */
function getAllSubmissions() {
  return submissions;
}

module.exports = {
  addJobPosting,
  addRoomListing,
  addGeneralEnquiry,
  addNewsletterEmail,
  getAllSubmissions,
};
