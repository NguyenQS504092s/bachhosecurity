import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, update } from 'firebase/database';

// Firebase configuration - must match lib/firebase.ts
const firebaseConfig = {
  databaseURL: 'https://bachho-timesheet-2025-default-rtdb.asia-southeast1.firebasedatabase.app'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Config
const YEAR = 2025;
const MONTH = 12; // December

// Get days in month
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

// Check if weekend
function isWeekend(year, month, day) {
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
}

// Generate random attendance value
function generateAttendance(isWeekendDay) {
  const rand = Math.random();

  if (isWeekendDay) {
    // Weekend: 70% nghỉ (CN), 20% đi làm (1), 10% nửa ngày (0.5)
    if (rand < 0.7) return 'CN';
    if (rand < 0.9) return '1';
    return '0.5';
  } else {
    // Weekday: 85% đi làm (1), 8% nửa ngày (0.5), 5% nghỉ phép (P), 2% nghỉ (CN)
    if (rand < 0.85) return '1';
    if (rand < 0.93) return '0.5';
    if (rand < 0.98) return 'P';
    return 'CN';
  }
}

// Generate attendance for an employee
function generateEmployeeAttendance(daysInMonth) {
  const attendance = {};

  for (let day = 1; day <= daysInMonth; day++) {
    const isWeekendDay = isWeekend(YEAR, MONTH, day);
    attendance[day] = generateAttendance(isWeekendDay);
  }

  return attendance;
}

async function seedAttendanceData() {
  console.log(`🚀 Bắt đầu seed dữ liệu chấm công tháng ${MONTH}/${YEAR}...\n`);

  try {
    // Fetch all employees
    const snapshot = await get(ref(database, 'employees'));
    if (!snapshot.exists()) {
      console.log('❌ Không tìm thấy nhân viên nào trong database!');
      process.exit(1);
    }

    const employees = snapshot.val();
    const employeeIds = Object.keys(employees);
    const daysInMonth = getDaysInMonth(YEAR, MONTH);

    console.log(`📋 Tìm thấy ${employeeIds.length} nhân viên`);
    console.log(`📅 Tháng ${MONTH}/${YEAR} có ${daysInMonth} ngày\n`);

    // Update each employee with attendance data
    for (const empId of employeeIds) {
      const emp = employees[empId];
      const attendance = generateEmployeeAttendance(daysInMonth);

      // Calculate total work days
      const totalWork = Object.values(attendance).reduce((sum, val) => {
        const num = parseFloat(val);
        return sum + (isNaN(num) ? 0 : num);
      }, 0);

      await update(ref(database, `employees/${empId}`), { attendance });
      console.log(`  ✓ ${emp.name || emp.code}: ${totalWork} công`);
    }

    console.log('\n✅ Hoàn thành! Dữ liệu chấm công đã được seed.');
    console.log('\n🔄 Refresh lại trang web để xem dữ liệu mới.');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  }
}

// Run seed
seedAttendanceData();
