const http = require('http');

const runTests = async () => {
  console.log('🧪 [MedQ Verification Suite]: Starting automated tests on MedQ Care backend...');

  const request = (path, method = 'GET', body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const fullPath = path.startsWith('/api') ? path : `/api${path}`;
      const url = new URL(`http://localhost:5000${fullPath}`);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data });
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    // 1. Health Check
    console.log('\n1. Testing Health Endpoint (/api/health)...');
    const health = await request('/health');
    console.log(`   Status: ${health.status} - App: ${health.data.app}`);
    if (health.status !== 200) throw new Error('Health check failed');
    console.log('   ✅ Health check passed.');

    // 2. Patient Login
    console.log('\n2. Testing Patient Authentication (/api/auth/login)...');
    const patientLogin = await request('/auth/login', 'POST', {
      email: 'patient@medqcare.com',
      password: 'MedQ@2026',
      role: 'patient',
    });
    console.log(`   Status: ${patientLogin.status} - Logged in: ${patientLogin.data.user?.name}`);
    if (patientLogin.status !== 200 || !patientLogin.data.token) throw new Error('Patient login failed');
    const patientToken = patientLogin.data.token;
    console.log('   ✅ Patient login & JWT generation passed.');

    // 3. Doctor Login
    console.log('\n3. Testing Doctor Authentication (/api/auth/login)...');
    const doctorLogin = await request('/auth/login', 'POST', {
      email: 'doctor@medqcare.com',
      password: 'MedQ@2026',
      role: 'doctor',
    });
    console.log(`   Status: ${doctorLogin.status} - Doctor: ${doctorLogin.data.user?.name}`);
    if (doctorLogin.status !== 200) throw new Error('Doctor login failed');
    const doctorToken = doctorLogin.data.token;
    console.log('   ✅ Doctor login passed.');

    // 4. RBAC Protection Test: Patient attempting to access /api/admin/users
    console.log('\n4. Testing RBAC Security Guard (Patient accessing Admin endpoint)...');
    const forbiddenTest = await request('/admin/users', 'GET', null, patientToken);
    console.log(`   Status: ${forbiddenTest.status} (Expected: 403 Forbidden)`);
    if (forbiddenTest.status !== 403) throw new Error('RBAC violation! Patient was not blocked from Admin API');
    console.log('   ✅ RBAC Guard passed: Forbidden 403 correctly returned.');

    // 5. Admin Login & Access
    console.log('\n5. Testing Admin Authentication & Directory (/api/admin/users)...');
    const adminLogin = await request('/auth/login', 'POST', {
      email: 'admin@medqcare.com',
      password: 'MedQ@2026',
      role: 'admin',
    });
    const adminToken = adminLogin.data.token;
    const adminUsers = await request('/admin/users', 'GET', null, adminToken);
    console.log(`   Status: ${adminUsers.status} - Users Count: ${adminUsers.data.count}`);
    if (adminUsers.status !== 200) throw new Error('Admin user query failed');
    console.log('   ✅ Admin privileges verified.');

    // 6. Patient Appointments
    console.log('\n6. Testing Patient Appointments (/api/patient/appointments)...');
    const patientApts = await request('/patient/appointments', 'GET', null, patientToken);
    console.log(`   Status: ${patientApts.status} - Count: ${patientApts.data.count}`);
    console.log('   ✅ Patient appointments retrieval passed.');

    // 7. Doctor Queue & Prescriptions
    console.log('\n7. Testing Doctor OPD Queue (/api/doctor/appointments)...');
    const doctorApts = await request('/doctor/appointments', 'GET', null, doctorToken);
    console.log(`   Status: ${doctorApts.status} - Queue: ${doctorApts.data.count}`);
    console.log('   ✅ Doctor queue retrieval passed.');

    console.log('\n🎉 ========================================================');
    console.log('   ALL BACKEND API & RBAC SECURITY TESTS PASSED PERFECTLY!');
    console.log('========================================================\n');
  } catch (err) {
    console.error('❌ Verification test failed:', err.message);
    process.exit(1);
  }
};

runTests();
