// รายชื่อสาขาใช้ชื่อเดียวกับ branches.branch_name ใน Backend
export const BRANCHES = [
  { value: "ลาดกระบัง", label: "สาขาลาดกระบัง" },
  { value: "ร่มเกล้า", label: "สาขาร่มเกล้า" },
  { value: "ปราจีนบุรี", label: "สาขาปราจีนบุรี" },
  { value: "หาดใหญ่", label: "สาขาหาดใหญ่" },
];

// คืนชื่อสาขามาตรฐาน ไม่คืนคำว่า "สาขา" เพื่อให้ตรงกับ Backend
export const getBranchValue = (branch) => {
  if (branch === null || branch === undefined) return "";

  if (typeof branch === "object") {
    const objectValue =
      branch.branch_name ||
      branch.branchName ||
      branch.name ||
      branch.label ||
      branch.value ||
      branch.branch_id ||
      branch.branchId ||
      "";
    return getBranchValue(objectValue);
  }

  const rawValue = String(branch).trim();
  if (!rawValue) return "";

  const normalized = rawValue.replace(/^สาขา\s*/i, "").trim().toLowerCase();
  const found = BRANCHES.find(
    (item) =>
      item.value.toLowerCase() === normalized ||
      item.label.toLowerCase() === rawValue.toLowerCase()
  );

  return found ? found.value : rawValue.replace(/^สาขา\s*/i, "").trim();
};

export const getBranchLabel = (branch) => {
  const value = getBranchValue(branch);
  const found = BRANCHES.find((item) => item.value === value);
  return found ? found.label : value ? `สาขา${value}` : "ไม่ได้ระบุ";
};
