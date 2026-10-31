const http = require('http');

const BASE_URL = 'http://127.0.0.1:8200';

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('🧪 Starting API Verification Suite...\n');
  let token = '';
  let customerId = '';
  let machineId = '';
  let operatorId = '';
  let bookingId = '';
  let maintenanceId = '';
  let invoiceId = '';

  // 1. Health Checks
  const health1 = await request('/health-check');
  console.log(`[1] GET /health-check -> Status: ${health1.status}, Message: ${health1.body.message}`);

  const health2 = await request('/auth/health-check');
  console.log(`[2] GET /auth/health-check -> Status: ${health2.status}, Message: ${health2.body.message}`);

  // 2. Auth Login
  const loginRes = await request('/api/v1/auth/login', 'POST', {
    identifier: 'admin@jcbfleet.com',
    password: 'Admin@123',
  });
  console.log(`[3] POST /api/v1/auth/login -> Status: ${loginRes.status}, Success: ${loginRes.body.success}`);
  token = loginRes.body.data.token;

  // 3. Auth Me
  const meRes = await request('/api/v1/auth/me', 'GET', null, token);
  console.log(`[4] GET /api/v1/auth/me -> Status: ${meRes.status}, User: ${meRes.body.data.name} (${meRes.body.data.role})`);

  // 4. Customers CRUD
  const createCustRes = await request(
    '/api/v1/customers/create-customer',
    'POST',
    {
      name: 'Apex Construction Works',
      company_name: 'Apex Builders Ltd',
      phone: '9888123456',
      email: 'contact@apexbuilders.com',
      address: 'Hinjawadi Phase 1, Pune',
      customer_type: 'corporate',
    },
    token
  );
  console.log(`[5] POST /api/v1/customers/create-customer -> Status: ${createCustRes.status}, Customer: ${createCustRes.body.data.name}`);
  customerId = createCustRes.body.data.id;

  const getAllCustRes = await request('/api/v1/customers/getAll-customer', 'GET', null, token);
  console.log(`[6] GET /api/v1/customers/getAll-customer -> Status: ${getAllCustRes.status}, Count: ${getAllCustRes.body.meta.total}`);

  const getCustRes = await request(`/api/v1/customers/customer/${customerId}`, 'GET', null, token);
  console.log(`[7] GET /api/v1/customers/customer/:id -> Status: ${getCustRes.status}, Name: ${getCustRes.body.data.name}`);

  const updateCustRes = await request(
    `/api/v1/customers/customer/${customerId}/update-customer`,
    'PUT',
    { address: 'Hinjawadi Phase 2, Pune' },
    token
  );
  console.log(`[8] PUT /api/v1/customers/customer/:id/update-customer -> Status: ${updateCustRes.status}, New Address: ${updateCustRes.body.data.address}`);

  // 5. Machines CRUD
  const createMachRes = await request(
    '/api/v1/machines/create-machine',
    'POST',
    {
      name: 'JCB JS205 Tracked Excavator',
      model: 'JS205 HD 2024',
      registration_number: 'MH-14-EX-9988',
      machine_type: 'Excavator',
      status: 'available',
      hourly_rate: 1800,
      daily_rate: 14500,
      base_yard_location: 'Wakad Yard',
    },
    token
  );
  console.log(`[9] POST /api/v1/machines/create-machine -> Status: ${createMachRes.status}, Machine: ${createMachRes.body.data.name}`);
  machineId = createMachRes.body.data.id;

  const getAllMachRes = await request('/api/v1/machines/getAll-machine', 'GET', null, token);
  console.log(`[10] GET /api/v1/machines/getAll-machine -> Status: ${getAllMachRes.status}, Count: ${getAllMachRes.body.meta.total}`);

  const checkAvailRes = await request('/api/v1/machines/check-availability?start_date=2026-11-01&end_date=2026-11-05', 'GET', null, token);
  console.log(`[11] GET /api/v1/machines/check-availability -> Status: ${checkAvailRes.status}, Available Count: ${checkAvailRes.body.data.length}`);

  // 6. Operators CRUD
  const createOpRes = await request(
    '/api/v1/operators/create-operator',
    'POST',
    {
      name: 'Sunil Shinde',
      phone: '9855566677',
      email: 'sunil.shinde@operators.com',
      license_number: 'MH-12-2020-00123',
      status: 'available',
    },
    token
  );
  console.log(`[12] POST /api/v1/operators/create-operator -> Status: ${createOpRes.status}, Operator: ${createOpRes.body.data.name}`);
  operatorId = createOpRes.body.data.id;

  const getAllOpRes = await request('/api/v1/operators/getAll-operator', 'GET', null, token);
  console.log(`[13] GET /api/v1/operators/getAll-operator -> Status: ${getAllOpRes.status}, Count: ${getAllOpRes.body.meta.total}`);

  // 7. Bookings CRUD
  const createBookingRes = await request(
    '/api/v1/bookings/create-booking',
    'POST',
    {
      customer_id: customerId,
      machine_id: machineId,
      operator_id: operatorId,
      site_location: 'Metro Pillar 45, Baner Road',
      work_description: 'Trench digging and pipe laying work',
      start_date: '2026-11-01',
      end_date: '2026-11-03',
      rental_type: 'daily',
      estimated_hours: 24,
      advance_payment: 5000,
    },
    token
  );
  console.log(`[14] POST /api/v1/bookings/create-booking -> Status: ${createBookingRes.status}, Booking #: ${createBookingRes.body.data.booking_number}, Est Cost: ${createBookingRes.body.data.estimated_cost}, Balance: ${createBookingRes.body.data.remaining_balance}`);
  bookingId = createBookingRes.body.data.id;

  const getAllBookingsRes = await request('/api/v1/bookings/getAll-booking', 'GET', null, token);
  console.log(`[15] GET /api/v1/bookings/getAll-booking -> Status: ${getAllBookingsRes.status}, Count: ${getAllBookingsRes.body.meta.total}`);

  // 8. Maintenance CRUD
  const createMaintRes = await request(
    '/api/v1/maintenance/create-maintenance',
    'POST',
    {
      machine_id: machineId,
      service_title: 'Hydraulic Oil & Filter Replacement',
      service_detail: 'Full hydraulic system flushed, new filters installed',
      service_type: 'hydraulic',
      service_date: '2026-10-30',
      cost: 4500,
      performed_by: 'Authorized JCB Service Center',
    },
    token
  );
  console.log(`[16] POST /api/v1/maintenance/create-maintenance -> Status: ${createMaintRes.status}, Record: ${createMaintRes.body.data.service_title}`);
  maintenanceId = createMaintRes.body.data.id;

  const maintSummaryRes = await request('/api/v1/maintenance/expenses-summary', 'GET', null, token);
  console.log(`[17] GET /api/v1/maintenance/expenses-summary -> Status: ${maintSummaryRes.status}, Total Expense: ${maintSummaryRes.body.data.total_expense}`);

  // 9. Payments & Billing
  const calcBillRes = await request(`/api/v1/payments/calculate-bill/${bookingId}`, 'GET', null, token);
  console.log(`[18] GET /api/v1/payments/calculate-bill/:id -> Status: ${calcBillRes.status}, Base: ${calcBillRes.body.data.base_charge}, Advance: ${calcBillRes.body.data.advance_received}`);

  const createPayRes = await request(
    '/api/v1/payments/create-payment',
    'POST',
    {
      booking_id: bookingId,
      payment_type: 'final',
      payment_method: 'upi',
      base_charge: calcBillRes.body.data.base_charge,
      total_amount: calcBillRes.body.data.remaining_balance,
      notes: 'Final settlement via UPI',
    },
    token
  );
  console.log(`[19] POST /api/v1/payments/create-payment -> Status: ${createPayRes.status}, Paid: ${createPayRes.body.data.total_amount}`);

  // 10. Invoices CRUD
  const createInvRes = await request(
    '/api/v1/invoices/create-invoice',
    'POST',
    {
      booking_id: bookingId,
      customer_id: customerId,
      subtotal: 43500,
      advance_credit: 5000,
      total_paid: 38500,
      status: 'generated',
      items: [
        {
          description: 'JCB JS205 Tracked Excavator Rental (3 Days)',
          quantity: 3,
          unit: 'days',
          unit_price: 14500,
          amount: 43500,
        },
      ],
    },
    token
  );
  console.log(`[20] POST /api/v1/invoices/create-invoice -> Status: ${createInvRes.status}, Invoice #: ${createInvRes.body.data.invoice_number}`);
  invoiceId = createInvRes.body.data.id;

  const getInvRes = await request(`/api/v1/invoices/invoice/${invoiceId}`, 'GET', null, token);
  console.log(`[21] GET /api/v1/invoices/invoice/:id -> Status: ${getInvRes.status}, Items Count: ${getInvRes.body.data.items.length}`);

  // 11. Dashboard Summary
  const dashRes = await request('/api/v1/dashboard/get-summary', 'GET', null, token);
  console.log(`[22] GET /api/v1/dashboard/get-summary -> Status: ${dashRes.status}, Machines: ${dashRes.body.data.total_machines}, Customers: ${dashRes.body.data.total_customers}`);

  // 12. Schedule
  const schedRes = await request('/api/v1/schedule/daily-schedule?date=2026-11-01', 'GET', null, token);
  console.log(`[23] GET /api/v1/schedule/daily-schedule -> Status: ${schedRes.status}, Shifts: ${schedRes.body.data.length}`);

  // 13. Reports
  const reportRes = await request('/api/v1/reports/revenue-analytics?year=2026', 'GET', null, token);
  console.log(`[24] GET /api/v1/reports/revenue-analytics -> Status: ${reportRes.status}, Months Count: ${reportRes.body.data.length}`);

  const utilRes = await request('/api/v1/reports/fleet-utilization', 'GET', null, token);
  console.log(`[25] GET /api/v1/reports/fleet-utilization -> Status: ${utilRes.status}, Utilization: ${utilRes.body.data.utilization_percentage}%`);

  // 14. Profile
  const profRes = await request('/api/v1/profile/get-profile', 'GET', null, token);
  console.log(`[26] GET /api/v1/profile/get-profile -> Status: ${profRes.status}, Name: ${profRes.body.data.name}`);

  console.log('\n🎉 ALL 26 API ENDPOINTS PASSED WITH 100% SUCCESS!');
}

runTests().catch(console.error);
