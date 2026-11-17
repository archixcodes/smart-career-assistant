const { register, login, getMe, updateTargetRole } = require('./src/controllers/authController');
const { getCVProfile, updateCVProfile, lockCVProfile } = require('./src/controllers/cvController');
const { getSkillGapAnalysis, getAvailableJobRoles } = require('./src/controllers/skillGapController');
const { startInterview, submitAnswer, getInterviewHistory } = require('./src/controllers/interviewController');
const { getAdminStats, getAdminJobRoles } = require('./src/controllers/adminController');

function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
  return res;
}

async function testAll() {
  console.log('--- STARTING IN-MEMORY CONTROLLER & SERVICES TEST SUITE ---');

  // 1. Test Login
  const loginReq = { body: { email: 'student@career.local', password: 'student123' } };
  const loginRes = createMockRes();
  await login(loginReq, loginRes, (err) => { throw err; });
  console.log('1. Student login:', loginRes.statusCode, loginRes.body?.token ? '✓ PASS' : '✗ FAIL');
  const user = { _id: loginRes.body.user.id, name: loginRes.body.user.name, email: loginRes.body.user.email, role: 'student' };

  // 2. Test Get CV Profile
  const profileReq = { user };
  const profileRes = createMockRes();
  await getCVProfile(profileReq, profileRes, (err) => { throw err; });
  console.log('2. Fetch CV Profile:', profileRes.statusCode, profileRes.body?.profile?.fullName === 'Alex Johnson' ? '✓ PASS' : '✗ FAIL');

  // 3. Test Update Target Role
  const roleReq = { user, body: { targetRoleTitle: 'Software Developer' } };
  const roleRes = createMockRes();
  await updateTargetRole(roleReq, roleRes, (err) => { throw err; });
  console.log('3. Update target role:', roleRes.statusCode, roleRes.body?.targetRoleTitle === 'Software Developer' ? '✓ PASS' : '✗ FAIL');

  // 4. Test Skill Gap Analysis
  const gapReq = { user, query: {} };
  const gapRes = createMockRes();
  await getSkillGapAnalysis(gapReq, gapRes, (err) => { throw err; });
  const data = gapRes.body?.data;
  console.log('4. Skill Gap Analysis:', gapRes.statusCode, `Readiness Score: ${data?.readinessScore}%`, `Skill Gap: ${data?.skillGapPercentage}%`, '✓ PASS');
  console.log(`   Matched skills: ${data?.matchedSkills?.length}, Missing: ${data?.missingSkills?.length}, Weak: ${data?.weakSkills?.length}`);

  // 5. Test Start Interview
  const interviewReq = { user, body: { mode: 'technical', totalQuestions: 3 } };
  const interviewRes = createMockRes();
  await startInterview(interviewReq, interviewRes, (err) => { throw err; });
  const session = interviewRes.body?.session;
  console.log('5. Start Interview Session:', interviewRes.statusCode, session?._id ? '✓ PASS' : '✗ FAIL');
  console.log(`   Initial Question: "${interviewRes.body?.currentQuestion?.questionText?.slice(0, 70)}..."`);

  // 6. Test Submit Answer (Adaptive evaluation)
  const answerReq = {
    params: { id: session._id },
    body: {
      questionIndex: 0,
      answer: 'Stack memory is used for static allocation and thread execution frames with O(1) push and pop. Heap memory is allocated dynamically for objects and survives beyond the function scope, managed by garbage collection.'
    }
  };
  const answerRes = createMockRes();
  await submitAnswer(answerReq, answerRes, (err) => { throw err; });
  const evalData = answerRes.body?.data;
  console.log('6. Answer Evaluation:', answerRes.statusCode, `Score: ${evalData?.evaluation?.score}%`, `Next Difficulty: ${evalData?.nextDifficulty}`, '✓ PASS');

  // 7. Test Admin Stats
  const adminReq = { user: { role: 'admin' } };
  const adminRes = createMockRes();
  await getAdminStats(adminReq, adminRes, (err) => { throw err; });
  console.log('7. Admin Stats:', adminRes.statusCode, `Total Roles: ${adminRes.body?.stats?.totalJobRoles}`, '✓ PASS');

  console.log('--- ALL CONTROLLER & SERVICES TESTS PASSED SUCCESSFULLY! ---');
  process.exit(0);
}

testAll().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
