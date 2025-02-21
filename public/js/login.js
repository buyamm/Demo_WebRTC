const loginForm = document.getElementById("login-form");
const loadingContainer = document.getElementById("loading-container");
const emailInput = document.getElementById("email");
const errorContainer = document.getElementById("error-container");

const passEmail = ["truongcongly139@gmail.com", "lytc.22it@vku.udn.vn"];
function showLoading() {
  loginForm.style.display = "none";
  loadingContainer.style.display = "block";

  const email = emailInput.value;

  if (passEmail.includes(email)) {
    localStorage.setItem("userEmail", email);
    setTimeout(function () {
      window.location.href = "remote_screen";
    }, 2000);
  } else {
    setTimeout(function () {
      loadingContainer.style.display = "none";
      errorContainer.style.display = "block";
      loginForm.style.display = "block";
    }, 2000);
  }
}
