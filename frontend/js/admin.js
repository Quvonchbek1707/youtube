const videoForm = document.getElementById("videoForm");
const uploadInput = document.getElementById("uploadInput");
const videoInput = document.getElementById("videoInput");
const videosList = document.getElementById("videosList");
const API_BASE_URL = "http://localhost:4445";

const token = localStorage.getItem("accessToken");

function getCurrentUserId() {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
    } catch {
        return null;
    }
}

videoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!uploadInput.files.length || !videoInput.value) {
        alert("Please select a file and enter a title.");
        return;
    }

    const formData = new FormData();
    formData.append("file", uploadInput.files[0]);
    formData.append("title", videoInput.value);

    try {
        const res = await axios.post(`${API_BASE_URL}/api/files`, formData, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        alert(res.data.message || "Upload successful");
        videoInput.value = "";
        uploadInput.value = "";
        loadVideos();
    } catch (err) {
        console.error("Upload error:", err);
        const errorMsg = err.response?.data?.message || err.message || "Upload failed";
        alert(errorMsg);
    }
});

function formatVideo(video) {
    const created = new Date(video.created_at);
    const date = created.toISOString().split("T")[0];
    const time = created.toTimeString().split(":").slice(0, 2).join(":");
    const avatarUrl = `${API_BASE_URL}/api/avatar/${video.user?.id}`;

    return `
    <li class="iframe" data-id="${video.id}">
        <div class="admin-actions">
            <button class="edit-btn zmdi zmdi-edit" onclick="showEdit(${video.id}, '${video.title}')"></button>
            <button class="delete-btn zmdi zmdi-delete" onclick="deleteVideo(${video.id})"></button>
        </div>
        <video src="${API_BASE_URL}/uploads/videos/${video.file_name}" controls></video>
        <div class="iframe-footer">
            <img src="${avatarUrl}" alt="channel-icon" class="online">
            <div class="iframe-footer-text">
                <div class="title-edit-container" id="title-container-${video.id}">
                    <h3 class="iframe-title">${video.title}</h3>
                </div>
                <h2 class="channel-name">${video.user?.username || 'Unknown'}</h2>
                <time class="uploaded-time">${date} | ${time}</time>
                <div class="download-info">
                    <span>${video.size} MB</span>
                </div>
            </div>
        </div>
    </li>`;
}

async function loadVideos() {
    if (!token) return window.location.href = '/login';

    videosList.innerHTML = '<p style="text-align:center; padding: 20px;">Loading your videos...</p>';
    try {
        console.log('Fetching videos from:', `${API_BASE_URL}/api/files/me`);
        const res = await axios.get(`${API_BASE_URL}/api/files/me`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        console.log('Response:', res.data);
        const videos = res.data.data || res.data || [];
        console.log('Videos array:', videos);

        videosList.innerHTML = videos.length
            ? videos.map(formatVideo).join("")
            : `<h2 style="text-align:center; margin-top:50px; width: 100%;">No videos found</h2>`;
    } catch (err) {
        console.error('Error loading videos:', err);
        console.error('Error response:', err.response?.data);
        videosList.innerHTML = `<h2 style="text-align:center; color:red; margin-top:50px; width: 100%;">Error loading videos: ${err.message}</h2>`;
    }
}

window.showEdit = function (id, currentTitle) {
    const container = document.getElementById(`title-container-${id}`);
    container.innerHTML = `
        <div class="edit-box">
            <input type="text" id="edit-input-${id}" value="${currentTitle}" class="edit-input">
            <button onclick="submitEdit(${id})" class="edit-submit zmdi zmdi-check"></button>
            <button onclick="cancelEdit(${id}, '${currentTitle}')" class="edit-cancel zmdi zmdi-close"></button>
        </div>
    `;
};

window.cancelEdit = function (id, title) {
    const container = document.getElementById(`title-container-${id}`);
    container.innerHTML = `<h3 class="iframe-title">${title}</h3>`;
};

window.submitEdit = async function (id) {
    const input = document.getElementById(`edit-input-${id}`);
    const newTitle = input.value.trim();
    if (!newTitle) return alert("Title cannot be empty");

    try {
        await axios.put(`${API_BASE_URL}/api/files/${id}`, { title: newTitle }, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        loadVideos();
    } catch (err) {
        console.error(err);
        alert("Failed to update title");
    }
};

window.deleteVideo = async function (id) {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
        await axios.delete(`${API_BASE_URL}/api/files/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        loadVideos();
    } catch (err) {
        console.error(err);
        alert("Failed to delete video");
    }
};

loadVideos();

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
});
