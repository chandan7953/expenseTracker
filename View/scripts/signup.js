document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const password = form.password.value.trim();

    try {
      const response = await axios.post(
        "http://localhost:3000/api/register",
        { username, email, phone, password },
        { withCredentials: true }
      );

      window.location.href = "home.html";
    } catch (error) {
      const message =
        error.response?.data?.message || "Something went wrong during signup.";
      alert(message);
    }
  });
});
