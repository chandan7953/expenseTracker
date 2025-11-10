document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    try {
      const response = await axios.post("http://localhost:3000/api/login", {
        email,
        password,
      });
      window.location.href = "/";
    } catch (error) {
      const message =
        error.response?.data?.message || "Something went wrong during login.";
      alert(message);
    }
  });
});
