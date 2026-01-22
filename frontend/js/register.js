const API_BASE_URL = "http://localhost:4445";

const registerForm = document.getElementById("registerForm");
const usernameInput = document.getElementById("usernameInput");
const emailInput = document.getElementById("email");
const otpInput = document.getElementById("otpInput");
const passwordInput = document.getElementById("passwordInput");
const showButton = document.getElementById("showButton");
const uploadInput = document.getElementById("uploadInput");
const fileNameSpan = document.querySelector(".file-name");

const modal = document.getElementById("emailModal");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = modal.querySelector(".close");
const sendOtpBtn = document.getElementById("sendOtp");
const emailOtpInput = document.getElementById("emailInput");

showButton.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    showButton.classList.toggle("zmdi-eye-off", type === "text");
});

uploadInput.addEventListener("change", () => {
    if (uploadInput.files.length) {
        fileNameSpan.textContent = uploadInput.files[0].name;
    }
});

openModalBtn.addEventListener("click", () => modal.style.display = "block");
closeModalBtn.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });

sendOtpBtn.addEventListener("click", async () => {
    const email = emailOtpInput.value.trim();
    if (!email) return alert("Email kiriting");
    try {
        await axios.post(`${API_BASE_URL}/api/send`, { email });
        alert("OTP yuborildi");
        modal.style.display = "none";
    } catch (err) {
        alert("Xatolik, qayta urinib ko‘ring");
        console.error(err);
    }
});

registerForm.addEventListener("submit", async e => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const otp = otpInput.value.trim();
    const password = passwordInput.value.trim();
    const avatar = uploadInput.files[0];

    if (!username || !email || !otp || !password) return alert("Barcha maydonlarni to‘ldiring");

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("otp", otp);
    formData.append("password", password);
    if (avatar) formData.append("avatar", avatar);

    try {
        const response = await axios.post(`${API_BASE_URL}/api/register`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        if (response.data.success) {
            alert("Ro‘yxatdan o‘tish muvaffaqiyatli");
            window.location.href = "/login";
        } else {
            alert(response.data.message || "Ro‘yxatdan o‘tishda xatolik");
        }
    } catch (err) {
        console.error(err);
        alert("Serverda xatolik yuz berdi");
    }
});
