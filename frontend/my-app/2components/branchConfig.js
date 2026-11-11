
 // รายชื่อสาขาที่ใช้ร่วมกันทั้งหน้าจองและหน้าพนักงาน
// value ต้องตรงกับ branches.branch_name ใน Backend
export const BRANCHES = Object.freeze([
  { label: "สาขาลาดกระบัง", value: "ลาดกระบัง" },
  { label: "สาขาร่มเกล้า", value: "ร่มเกล้า" },
  { label: "สาขาปราจีนบุรี", value: "ปราจีนบุรี" },
  { label: "สาขาหาดใหญ่", value: "หาดใหญ่" },
]);

export const getBranchValue = (branch) =>
  String(branch || "").trim().replace(/^สาขา\s*/, "").trim();

export const getBranchLabel = (branch) => {
  const value = getBranchValue(branch);
  const found = BRANCHES.find((item) => item.value === value);
  return found ? found.label : value ? `สาขา${value}` : "";
};
