const form = document.getElementById("forgotPasswordForm");
const successCard = document.getElementById("successCard");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const loadingSpinner = document.getElementById("loadingSpinner");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = form.email.value.trim();
  if (!email) return alert("Enter your email");

  btnText.textContent = "Sending...";
  loadingSpinner.classList.remove("hidden");
  submitBtn.disabled = true;

  try {
    const res = await axios.post("http://localhost:3000/api/forgot-password", {
      email,
    });
    form.classList.add("hidden");
    successCard.classList.remove("hidden");
  } catch (err) {
    alert(err.response?.data?.message || "Failed to send reset link");
  } finally {
    btnText.textContent = "Send Reset Link";
    loadingSpinner.classList.add("hidden");
    submitBtn.disabled = false;
  }
});
