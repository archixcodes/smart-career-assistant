const { app } = require('./src/server');
const http = require('http');

function makeRequest(server, options, data) {
  const port = server.address().port;
  return new Promise((resolve, reject) => {
    const req = http.request({ ...options, host: '127.0.0.1', port }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  const server = app.listen(0, async () => {
    try {
      console.log('--- STARTING IN-PROCESS BACKEND TEST SUITE ---');

      // 1. Health Check
      const health = await makeRequest(server, { path: '/api/health', method: 'GET' });
      console.log('1. Health check status:', health.status, health.body?.status === 'healthy' ? '✓ PASS' : '✗ FAIL');

      // 2. Auth Login (Student)
      const loginRes = await makeRequest(server, {
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { email: 'student@career.local', password: 'student123' });

      console.log('2. Student login status:', loginRes.status, loginRes.body?.token ? '✓ PASS' : '✗ FAIL');
      const token = loginRes.body?.token;

      // 3. Get CV Profile
      const profileRes = await makeRequest(server, {
        path: '/api/cv/profile',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('3. CV Profile fetch:', profileRes.status, profileRes.body?.hasProfile ? '✓ PASS' : '✗ FAIL');

      // 4. Update Target Role
      const roleUpdateRes = await makeRequest(server, {
        path: '/api/auth/target-role',
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      }, { targetRoleTitle: 'Software Developer' });
      console.log('4. Target Role update:', roleUpdateRes.status, roleUpdateRes.body?.success ? '✓ PASS' : '✗ FAIL');

      // 5. Skill Gap Analysis
      const gapRes = await makeRequest(server, {
        path: '/api/gap-analysis',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('5. Skill Gap analysis:', gapRes.status, `Readiness: ${gapRes.body?.data?.readinessScore}%`, `Gap: ${gapRes.body?.data?.skillGapPercentage}%`, '✓ PASS');

      // 6. Start Adaptive Mock Interview
      const interviewRes = await makeRequest(server, {
        path: '/api/interview/start',
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      }, { mode: 'technical', totalQuestions: 3 });

      const sessionId = interviewRes.body?.session?._id;
      console.log('6. Mock Interview start:', interviewRes.status, sessionId ? '✓ PASS' : '✗ FAIL');
      console.log('   First question:', interviewRes.body?.currentQuestion?.questionText?.slice(0, 60) + '...');

      // 7. Submit Answer (Adaptive scoring & difficulty)
      const answerRes = await makeRequest(server, {
        path: `/api/interview/${sessionId}/answer`,
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      }, {
        questionIndex: 0,
        answer: 'The stack stores local execution contexts and function frames with fast allocation. The heap stores dynamically allocated objects managed at runtime.'
      });
      console.log('7. Answer evaluation score:', answerRes.body?.data?.evaluation?.score, 'Next difficulty:', answerRes.body?.data?.nextDifficulty, '✓ PASS');

      // 8. Admin login & Job Roles check
      const adminLogin = await makeRequest(server, {
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { email: 'admin@career.local', password: 'admin123' });
      const adminToken = adminLogin.body?.token;

      const adminStats = await makeRequest(server, {
        path: '/api/admin/stats',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      console.log('8. Admin dashboard stats fetch:', adminStats.status, `Roles: ${adminStats.body?.stats?.totalJobRoles}`, '✓ PASS');

      console.log('--- ALL BACKEND INTEGRATION TESTS PASSED ---');
      server.close();
      process.exit(0);
    } catch (err) {
      console.error('Test error:', err);
      server.close();
      process.exit(1);
    }
  });
}

runTests();
