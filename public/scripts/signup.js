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

      window.location.href = "/";
    } catch (error) {
      const message =
        error.response?.data?.message || "Something went wrong during signup.";
      alert(message);
    }
  });

  async function redirectIfAuthenticated() {
    try {
      const authRes = await axios.get("http://localhost:3000/api/check-auth", {
        withCredentials: true,
      });

      if (authRes.data.user.id) {
        window.location.href = "/";
      }
    } catch (err) {
      console.log("User not authenticated, can access page.");
    }
  }

  redirectIfAuthenticated();
});
