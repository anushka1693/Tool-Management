async function loadUser() {
  const res = await fetch('/.auth/me');
  const data = await res.json();

  if (!data.clientPrincipal) {
    window.location.href = "/.auth/login/aad";
    return;
  }

  const user = data.clientPrincipal;

  const name = user.userDetails;
  const email = user.userId;

  document.getElementById("userName").innerText = name;

  // 🔥 CALL GRAPH API (via Azure function)
  const profileRes = await fetch('/api/getUserProfile');
  const profile = await profileRes.json();

  document.getElementById("userRole").innerText = profile.role;
  document.getElementById("userDesignation").innerText = profile.designation;
  document.getElementById("userPractice").innerText = profile.practice;

  window.currentUser = {
    name,
    email,
    role: profile.role,
    designation: profile.designation,
    practice: profile.practice
  };

  applyRoleAccess(profile.role);
}

function logout() {
  window.location.href = "/.auth/logout?post_logout_redirect_uri=/login.html";
}
