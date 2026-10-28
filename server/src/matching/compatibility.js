// Which recipient groups each donor group can give to.
const CAN_GIVE_TO = {
  "O-":  ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+":  ["O+", "A+", "B+", "AB+"],
  "A-":  ["A-", "A+", "AB-", "AB+"],
  "A+":  ["A+", "AB+"],
  "B-":  ["B-", "B+", "AB-", "AB+"],
  "B+":  ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

// Requests marked "Not sure" are shown to every donor
export function canDonateTo(donorGroup) {
  return [...(CAN_GIVE_TO[donorGroup] ?? []), "UNKNOWN"];
}