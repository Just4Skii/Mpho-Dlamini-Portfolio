// CRM-ready abstraction for enquiry submission.
// Frontend-only for portfolio — swap implementation to integrate HubSpot, Salesforce, Zoho or Dynamics.

export type EnquiryPayload = {
  help: string[];
  property: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  message?: string;
  meta?: {
    page?: string;
    referrer?: string;
    timestamp?: string;
  };
};

export async function submitEnquiry(payload: EnquiryPayload): Promise<{ ok: true }> {
  // In production, POST to /api/enquiries or directly to CRM:
  // await fetch('/api/enquiries', { method: 'POST', body: JSON.stringify(payload) })
  // HubSpot: await hubspotClient.createContact(...)
  // Salesforce: await sf.createLead(...)
  // Analytics: track('enquiry_submitted', { help: payload.help, property: payload.property })
  console.log("[demo] submitEnquiry", payload);
  // Simulate network
  await new Promise((r) => setTimeout(r, 600));
  return { ok: true };
}

// Analytics-ready helper — attach where needed
export function track(event: string, props?: Record<string, unknown>) {
  // Replace with gtag, Segment, PostHog, etc.
  // gtag('event', event, props)
  console.log("[analytics]", event, props);
}
