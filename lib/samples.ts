import type { IncidentInput } from "@/types/investigation";

export const sampleIncidents: IncidentInput[] = [
  {
    title: "Hospital ransomware",
    source: "sample",
    demoMode: true,
    context:
      "At 04:15 Monday, Northbridge Hospital detected encrypted workstations across radiology and admissions. Staff reported a ransom note demanding 22 BTC. EHR access became intermittent, ambulances were diverted for six hours, and four elective surgeries were postponed. Initial review found a VPN account without MFA used from an overseas IP at 03:52. Backups are available but the last immutable snapshot is 36 hours old."
  },
  {
    title: "Investment fraud",
    source: "sample",
    demoMode: true,
    context:
      "A wealth management client claims an advisor placed $2.8M into a private fund using forged authorization forms. Transfers occurred over three tranches between March and May. The fund website is now offline, distributions stopped, and phone records show repeated calls from the advisor before each transfer. Compliance flagged missing suitability notes but the exception was closed without manager approval."
  },
  {
    title: "Data breach",
    source: "sample",
    demoMode: true,
    context:
      "A SaaS vendor discovered customer profile data exposed through a misconfigured object storage bucket. Access logs show public reads for 18 days. The affected dataset includes names, email addresses, company names, and support ticket metadata. No passwords or payment cards were present. The change followed a rushed analytics migration and skipped security review."
  },
  {
    title: "Lost laptop",
    source: "sample",
    demoMode: true,
    context:
      "A regional sales director lost a company laptop in a rideshare after a client dinner. The device last checked in at 22:44 and has not come online since. Disk encryption is enabled, but the user stored a spreadsheet of 1,200 prospects on the desktop. The endpoint agent shows the device was unlocked shortly before loss. Remote wipe is pending network connectivity."
  },
  {
    title: "Supply chain failure",
    source: "sample",
    demoMode: true,
    context:
      "A tier-two component supplier missed three deliveries after flooding damaged its primary plant. Production of the flagship device is now constrained to nine days of inventory. Procurement knew the site was in a flood plain, but the alternate supplier was never qualified. Customer shipments to two strategic accounts will slip unless expedited sourcing succeeds within 72 hours."
  }
];
