const params = new URLSearchParams(window.location.search);
const token = params.get("token");
const form = document.getElementById("resetForm");
const message = document.getElementById("message");
const successCard = document.getElementById("successCard");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  message.textContent = "";

  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document
    .getElementById("confirmPassword")
    .value.trim();

  if (newPassword !== confirmPassword) {
    message.textContent = "Passwords do not match!";
    return;
  }

  try {
    const response = await axios.post(
      `http://localhost:3000/api/password/reset/${token}`,
      {
        newPassword,
      }
    );

    if (response.status === 200) {
      form.classList.add("hidden");
      successCard.classList.remove("hidden");
    }
  } catch (err) {
    const errMsg =
      err.response?.data?.message || "Server error. Please try again.";
    message.textContent = errMsg;
    console.error(err);
  }
});
