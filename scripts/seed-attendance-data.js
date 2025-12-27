import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, update } from 'firebase/database';

// Firebase configuration - must match lib/firebase.ts
const firebaseConfig = {
  databaseURL: 'https://bachho-timesheet-2025-default-rtdb.asia-southeast1.firebasedatabase.app'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Parse command line arguments
// Usage: npm run seed-attendance -- --year=2025 --month=12
// Or:    npm run seed-attendance -- --year=2025 --all (for full year)
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    year: 2025,
    month: null, // null means all months
    all: false
  };

  args.forEach(arg => {
    if (arg.startsWith('--year=')) {
      config.year = parseInt(arg.split('=')[1]) || 2025;
    }
    if (arg.startsWith('--month=')) {
      config.month = parseInt(arg.split('=')[1]);
    }
    if (arg === '--all') {
      config.all = true;
      config.month = null;
    }
  });

  // Default: if no args, seed all months of 2025
  if (args.length === 0) {
    config.all = true;
  }

  return config;
}

const CONFIG = parseArgs();
const YEAR = CONFIG.year;
const MONTHS_TO_SEED = CONFIG.month ? [CONFIG.month] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

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

// Generate attendance for an employee for a specific month
function generateEmployeeAttendance(year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  const attendance = {};

  for (let day = 1; day <= daysInMonth; day++) {
    const isWeekendDay = isWeekend(year, month, day);
    attendance[day] = generateAttendance(isWeekendDay);
  }

  return attendance;
}

// Calculate total work days from attendance
function calculateTotal(attendance) {
  return Object.values(attendance).reduce((sum, val) => {
    const num = parseFloat(val);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);
}

async function seedAttendanceData() {
  const monthNames = ['', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  console.log('🚀 Seed Attendance Data - Bach Ho Security');
  console.log('==========================================');
  console.log(`📆 Năm: ${YEAR}`);
  console.log(`📅 Tháng: ${MONTHS_TO_SEED.length === 12 ? 'Tất cả (1-12)' : MONTHS_TO_SEED.join(', ')}\n`);

  try {
    // Fetch all employees
    const snapshot = await get(ref(database, 'employees'));
    if (!snapshot.exists()) {
      console.log('❌ Không tìm thấy nhân viên nào trong database!');
      process.exit(1);
    }

    const employees = snapshot.val();
    const employeeIds = Object.keys(employees);

    console.log(`📋 Tìm thấy ${employeeIds.length} nhân viên\n`);

    let grandTotal = 0;

    // Seed each month
    for (const month of MONTHS_TO_SEED) {
      const daysInMonth = getDaysInMonth(YEAR, month);
      console.log(`\n📅 ${monthNames[month]} ${YEAR} (${daysInMonth} ngày)`);
      console.log('─'.repeat(40));

      let monthTotal = 0;

      // Update each employee with attendance data for this month
      for (const empId of employeeIds) {
        const emp = employees[empId];
        const attendance = generateEmployeeAttendance(YEAR, month);
        const total = calculateTotal(attendance);
        monthTotal += total;

        // For the currently selected month in the app (based on filter),
        // we store in employees/${empId}/attendance
        // This matches how the app currently reads data
        if (month === 12) {
          // December is the default view, update the main attendance field
          await update(ref(database, `employees/${empId}`), { attendance });
        }

        // Also store in timesheets collection for historical access
        await update(ref(database, `timesheets/${YEAR}/${month}/${empId}`), {
          employeeId: empId,
          employeeCode: emp.code,
          name: emp.name,
          attendance,
          total,
          year: YEAR,
          month
        });

        console.log(`  ✓ ${emp.name || emp.code}: ${total.toFixed(1)} công`);
      }

      grandTotal += monthTotal;
      console.log(`  📊 Tổng tháng: ${monthTotal.toFixed(1)} công`);
    }

    console.log('\n==========================================');
    console.log(`✅ Hoàn thành! Đã seed ${MONTHS_TO_SEED.length} tháng`);
    console.log(`📊 Tổng cộng: ${grandTotal.toFixed(1)} công`);
    console.log('\n🔄 Refresh trang web để xem dữ liệu mới.');
    console.log('\n💡 Tip: Dữ liệu được lưu tại:');
    console.log('   - employees/{id}/attendance (tháng 12 - hiển thị mặc định)');
    console.log('   - timesheets/{year}/{month}/{empId} (tất cả các tháng)');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  }
}

// Run seed
seedAttendanceData();
