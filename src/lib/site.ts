/** Site-wide facts used by the legal pages. */
export const site = {
  name: "Aevum",
  domain: "aevumperformance.ca",
  /** Public contact for privacy and legal requests. Shown on the legal pages once set. */
  contactEmail: null as string | null,
  /**
   * Heart rate monitor connections (Devices page, Today's Device source).
   * Off until live device sync is ready; the code stays in place.
   */
  devicesEnabled: false,
  /** Date the current privacy policy and terms took effect. */
  legalEffectiveDate: "September 22, 2026",
};
