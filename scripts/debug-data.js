import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

const app = initializeApp({ databaseURL: 'https://bachho-timesheet-2025-default-rtdb.asia-southeast1.firebasedatabase.app' });
const db = getDatabase(app);

async function debug() {
    const snapshot = await get(ref(db, 'employees'));
    const data = snapshot.val();

    console.log('=== RAW DATA ===');
    console.log('Is Array:', Array.isArray(data));
    console.log('Keys:', Object.keys(data));

    // Exact employee-service transform
    const employees = Object.keys(data).map(key => ({
        id: key,
        attendance: {},
        ...data[key]
    }));

    console.log('\n=== TRANSFORMED ===');
    console.log('Count:', employees.length);

    employees.forEach((emp, idx) => {
        const attKeys = Object.keys(emp.attendance || {}).length;
        const att1 = emp.attendance?.[1];
        console.log(`${idx}) ID:${emp.id} Name:${emp.name} AttKeys:${attKeys} Att[1]:${att1}`);
    });

    // Calculate total
    const calculateTotal = (attendance) => {
        if (!attendance) return 0;
        let total = 0;
        Object.values(attendance).forEach((val) => {
            const num = parseFloat(val);
            if (!isNaN(num)) total += num;
        });
        return total;
    };

    const grandTotal = employees.reduce((acc, curr) => acc + calculateTotal(curr.attendance), 0);
    console.log('\nGrand Total:', grandTotal, 'công');

    process.exit(0);
}

debug();
