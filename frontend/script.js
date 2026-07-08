const API_URL = '';

// Date Formatter
function formatCustomDate(dateString, includeTime = true) {
    const dateStrWithZ = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    const d = new Date(dateStrWithZ);
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    if (!includeTime) {
        return `${day} ${month} ${year}`;
    }
    const time = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${day} ${month} ${year}, ${time}`;
}

// Toast Notification System
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 'alert-circle';
    
    toast.innerHTML = `
        <i data-lucide="${icon}"></i>
        <div class="toast-message">${message}</div>
    `;
    
    container.appendChild(toast);
    if(window.lucide) lucide.createIcons({ root: toast });
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Auth Logic
function switchTab(tab) {
    if(tab === 'login') {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.remove('active');
    } else {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
        document.querySelectorAll('.tab-btn')[0].classList.remove('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    }
}

const loginForm = document.getElementById('loginForm');
if(loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new URLSearchParams();
        formData.append('username', document.getElementById('loginUsername').value);
        formData.append('password', document.getElementById('loginPassword').value);

        try {
            const res = await fetch(`${API_URL}/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });
            const data = await res.json();
            if(res.ok) {
                localStorage.setItem('access_token', data.access_token);
                window.location.href = 'dashboard.html';
            } else {
                document.getElementById('loginError').innerText = data.detail;
            }
        } catch(err) {
            document.getElementById('loginError').innerText = 'Server error. Is the backend running?';
        }
    });
}

const registerForm = document.getElementById('registerForm');
if(registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: document.getElementById('regName').value,
            username: document.getElementById('regUsername').value,
            email: document.getElementById('regEmail').value,
            age: parseInt(document.getElementById('regAge').value),
            contact: document.getElementById('regContact').value,
            password: document.getElementById('regPassword').value
        };

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(payload.contact)) {
            document.getElementById('regError').innerText = 'Contact number must be exactly 10 digits.';
            return;
        }

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if(res.ok) {
                switchTab('login');
                document.getElementById('loginUsername').value = payload.username;
                showToast('Registration successful! Please login.', 'success');
            } else {
                document.getElementById('regError').innerText = data.detail;
            }
        } catch(err) {
            document.getElementById('regError').innerText = 'Server error.';
        }
    });
}

// Dashboard Logic
function logout() {
    localStorage.removeItem('access_token');
    window.location.href = 'login.html';
}

let currentUserData = null;

async function fetchUserData() {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${API_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if(res.ok) {
        const user = await res.json();
        currentUserData = user;
        document.getElementById('userNameDisplay').innerText = `Welcome, ${user.name}`;
    } else if (res.status === 401) {
        handleTokenExpiry();
    }
}

// Profile Logic
function openProfileModal() {
    if (currentUserData) {
        document.getElementById('profName').value = currentUserData.name;
        document.getElementById('profUsername').value = currentUserData.username;
        document.getElementById('profEmail').value = currentUserData.email;
        document.getElementById('profAge').value = currentUserData.age;
        document.getElementById('profContact').value = currentUserData.contact;
    }
    document.getElementById('profError').innerText = '';
    document.getElementById('profSuccess').innerText = '';
    document.getElementById('profileModal').classList.remove('hidden');
}

function closeProfileModal() {
    document.getElementById('profileModal').classList.add('hidden');
}

const profileForm = document.getElementById('profileForm');
if(profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: document.getElementById('profName').value,
            email: document.getElementById('profEmail').value,
            age: parseInt(document.getElementById('profAge').value),
            contact: document.getElementById('profContact').value
        };

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(payload.contact)) {
            document.getElementById('profError').innerText = 'Contact number must be exactly 10 digits.';
            document.getElementById('profSuccess').innerText = '';
            return;
        }

        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`${API_URL}/users/me`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (res.status === 401) {
                handleTokenExpiry();
                return;
            }
            const data = await res.json();
            if(res.ok) {
                document.getElementById('profSuccess').innerText = 'Profile updated successfully!';
                document.getElementById('profError').innerText = '';
                fetchUserData(); // Refresh the displayed name
                setTimeout(closeProfileModal, 1500);
            } else {
                document.getElementById('profError').innerText = data.detail || 'Update failed';
                document.getElementById('profSuccess').innerText = '';
            }
        } catch(err) {
            document.getElementById('profError').innerText = 'Server error.';
            document.getElementById('profSuccess').innerText = '';
        }
    });
}

let allAvailableSymptoms = [];
let symptomsList = [];

function addSymptom(val) {
    if(val && !symptomsList.includes(val)) {
        symptomsList.push(val);
        renderSymptoms();
    }
    const input = document.getElementById('symptomSearchInput');
    if(input) input.value = '';
    const dropdown = document.getElementById('symptomDropdownList');
    if(dropdown) dropdown.classList.add('hidden');
}

function showDropdown() {
    const dropdown = document.getElementById('symptomDropdownList');
    if(dropdown) dropdown.classList.remove('hidden');
    filterSymptoms();
}

document.addEventListener('click', function(e) {
    const searchArea = document.querySelector('.custom-search');
    if(searchArea && !searchArea.contains(e.target)) {
        const dropdown = document.getElementById('symptomDropdownList');
        if(dropdown) dropdown.classList.add('hidden');
    }
});

function filterSymptoms() {
    const inputStr = document.getElementById('symptomSearchInput').value.toLowerCase();
    const dropdown = document.getElementById('symptomDropdownList');
    if(!dropdown) return;
    dropdown.innerHTML = '';
    
    const filtered = allAvailableSymptoms.filter(s => 
        s.toLowerCase().includes(inputStr) && !symptomsList.includes(s)
    );
    
    if(filtered.length === 0) {
        dropdown.innerHTML = '<div class="custom-dropdown-item" style="color:var(--text-muted); cursor:default;">No symptoms found</div>';
        return;
    }
    
    filtered.forEach(s => {
        const div = document.createElement('div');
        div.className = 'custom-dropdown-item';
        div.innerText = s;
        div.onclick = function() {
            addSymptom(s);
        };
        dropdown.appendChild(div);
    });
}

function removeSymptom(symp) {
    symptomsList = symptomsList.filter(s => s !== symp);
    renderSymptoms();
}

function renderSymptoms() {
    const container = document.getElementById('selectedSymptoms');
    if(!container) return;
    container.innerHTML = '';
    symptomsList.forEach(s => {
        const div = document.createElement('div');
        div.className = 'tag';
        div.innerHTML = `${s} <i data-lucide="x" onclick="removeSymptom('${s}')" style="width: 14px; height: 14px; cursor: pointer; color: var(--text-light); transition: color 0.2s;" onmouseover="this.style.color='var(--danger)'" onmouseout="this.style.color='var(--text-light)'"></i>`;
        container.appendChild(div);
    });
    if (window.lucide) {
        lucide.createIcons();
    }
}

let latestPrediction = null;

async function predictDisease() {
    if(symptomsList.length === 0) {
        showToast("Please add at least one symptom.", 'error');
        return;
    }
    
    showSpinner("Analyzing Symptoms...");
    
    const token = localStorage.getItem('access_token');
    try {
        const res = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ symptoms: symptomsList })
        });
        
        if (res.status === 401) {
            hideSpinner();
            handleTokenExpiry();
            return;
        }
        
        const data = await res.json();
        if(res.ok) {
            const combinedMedicine = data.medicine_description 
                ? `${data.medicines}\\n\\n${data.medicine_description}` 
                : data.medicines;

            latestPrediction = {
                symptoms: symptomsList,
                predicted_disease: data.predicted_disease,
                medicines: combinedMedicine,
                diet: data.diet,
                workout: data.workout
            };
            
            document.getElementById('resultsSection').classList.remove('hidden');
            document.getElementById('resDisease').innerText = data.predicted_disease;
            document.getElementById('resDiseaseDesc').innerText = data.disease_description || '';
            document.getElementById('resMedicine').innerText = data.medicines;
            document.getElementById('resMedicineDesc').innerText = data.medicine_description || '';
            document.getElementById('resDiet').innerText = data.diet;
            document.getElementById('resWorkout').innerText = data.workout;
            
            // Render Confidence Meter
            if (data.top_predictions) {
                const meterContainer = document.getElementById('confidenceMeter');
                meterContainer.style.display = 'block';
                meterContainer.innerHTML = '<h5>Top Predictions</h5>';
                
                data.top_predictions.forEach((pred, index) => {
                    const row = document.createElement('div');
                    row.className = 'confidence-row';
                    
                    let levelClass = 'low';
                    if (pred.confidence > 75) levelClass = 'high';
                    else if (pred.confidence > 40) levelClass = 'medium';
                    
                    row.innerHTML = `
                        <span style="font-size: 0.9rem;">${pred.disease}</span>
                        <span style="font-size: 0.9rem; font-weight: bold;">${pred.confidence}%</span>
                    `;
                    
                    const barBg = document.createElement('div');
                    barBg.className = 'confidence-bar-bg';
                    const barFill = document.createElement('div');
                    barFill.className = `confidence-bar-fill ${levelClass}`;
                    barFill.style.width = '0%';
                    
                    barBg.appendChild(barFill);
                    meterContainer.appendChild(row);
                    meterContainer.appendChild(barBg);
                    
                    // Animate
                    setTimeout(() => {
                        barFill.style.width = `${pred.confidence}%`;
                    }, 50 * index);
                });
            }
        } else {
            showToast("Error: " + JSON.stringify(data.detail), 'error');
        }
    } catch(err) {
        showToast("Server error.", 'error');
    } finally {
        hideSpinner();
    }
}

async function saveRecord() {
    if(!latestPrediction) return;
    
    const token = localStorage.getItem('access_token');
    try {
        const res = await fetch(`${API_URL}/save_record`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(latestPrediction)
        });
        
        if (res.status === 401) {
            handleTokenExpiry();
            return;
        }
        const data = await res.json();
        if(res.ok) {
            showToast("Record saved successfully!", 'success');
            loadHistory();
        } else {
            showToast("Error saving record.", 'error');
        }
    } catch(err) {
        showToast("Server error.", 'error');
    }
}

let userHistoryData = [];
let recordToDelete = null;
let currentHistoryPage = 1;
let currentViewedRecord = null;
let historySearchTimeout = null;

function onHistorySearch() {
    clearTimeout(historySearchTimeout);
    historySearchTimeout = setTimeout(() => {
        currentHistoryPage = 1;
        loadHistory();
    }, 500);
}



function changePage(delta) {
    currentHistoryPage += delta;
    loadHistory();
}

async function loadHistory() {
    const tableBody = document.getElementById('historyBody');
    if(!tableBody) return;
    
    const search = document.getElementById('historySearch')?.value || '';
    
    const token = localStorage.getItem('access_token');
    const url = `${API_URL}/history?page=${currentHistoryPage}&limit=5&search=${encodeURIComponent(search)}`;
    
    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if(res.ok) {
        const data = await res.json();
        userHistoryData = data.records || [];
        tableBody.innerHTML = '';
        
        if (userHistoryData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-light); padding: 2rem;">No records found.</td></tr>`;
        }
        
        userHistoryData.forEach((item, index) => {
            const date = formatCustomDate(item.created_at, false);
            tableBody.innerHTML += `
                <tr onclick="openHistoryModal(${index})" style="cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(15, 118, 110, 0.03)'" onmouseout="this.style.background='transparent'">
                    <td>${date}</td>
                    <td style="color: var(--text-light);">${item.symptoms.substring(0, 50)}${item.symptoms.length > 50 ? '...' : ''}</td>
                    <td><span class="table-tag">${item.predicted_disease}</span></td>
                    <td style="text-align: right;" onclick="event.stopPropagation(); openDeleteModal(${item.id})">
                        <button class="delete-icon-btn">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        // Update pagination controls
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        const pageIndicator = document.getElementById('pageIndicator');
        
        if (prevBtn && nextBtn && pageIndicator) {
            prevBtn.disabled = data.current_page <= 1;
            nextBtn.disabled = data.current_page >= data.total_pages;
            pageIndicator.innerText = `Page ${data.current_page} of ${Math.max(1, data.total_pages)}`;
        }
        
        if (window.lucide) {
            lucide.createIcons();
        }
    } else if (res.status === 401) {
        handleTokenExpiry();
    }
}

function openHistoryModal(index) {
    const item = userHistoryData[index];
    if (!item) return;
    
    currentViewedRecord = item;
    
    document.getElementById('histDate').innerText = formatCustomDate(item.created_at);
    document.getElementById('histSymptoms').innerText = item.symptoms;
    document.getElementById('histDisease').innerText = item.predicted_disease;
    document.getElementById('histMedicines').innerText = item.medicines;
    document.getElementById('histDiet').innerText = item.diet;
    document.getElementById('histWorkout').innerText = item.workout;
    
    document.getElementById('historyModal').classList.remove('hidden');
}

function closeHistoryModal() {
    currentViewedRecord = null;
    document.getElementById('historyModal').classList.add('hidden');
}

function downloadCSV() {
    if (!currentViewedRecord) return;
    
    const item = currentViewedRecord;
    const pName = currentUserData ? currentUserData.name : 'N/A';
    const pAge = currentUserData ? currentUserData.age : 'N/A';
    const pContact = currentUserData ? currentUserData.contact : 'N/A';
    
    const headers = ["Patient Name", "Age", "Contact", "Date", "Symptoms", "Predicted Disease", "Medicines", "Diet", "Workout"];
    const row = [
        `"${pName.replace(/"/g, '""')}"`,
        `"${String(pAge).replace(/"/g, '""')}"`,
        `"${String(pContact).replace(/"/g, '""')}"`,
        `"${formatCustomDate(item.created_at).replace(/"/g, '""')}"`,
        `"${item.symptoms.replace(/"/g, '""')}"`,
        `"${item.predicted_disease.replace(/"/g, '""')}"`,
        `"${item.medicines.replace(/"/g, '""')}"`,
        `"${item.diet.replace(/"/g, '""')}"`,
        `"${item.workout.replace(/"/g, '""')}"`
    ];
    
    const csvContent = headers.join(",") + "\r\n" + row.join(",");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `medical_record_${item.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function downloadPDF() {
    if (!currentViewedRecord) return;
    if (!window.jspdf) {
        showToast("PDF generator is still loading, please try again in a moment.", "error");
        return;
    }
    
    const item = currentViewedRecord;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Medical AI Diagnosis Report", 20, 20);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${formatCustomDate(item.created_at)}`, 20, 30);
    doc.text(`Record ID: #${item.id}`, 20, 38);
    
    const pName = currentUserData ? currentUserData.name : 'N/A';
    const pAge = currentUserData ? currentUserData.age : 'N/A';
    const pContact = currentUserData ? currentUserData.contact : 'N/A';
    doc.text(`Patient: ${pName} (Age: ${pAge}, Contact: ${pContact})`, 20, 46);
    
    doc.setFont("helvetica", "bold");
    doc.text("Predicted Condition:", 20, 58);
    doc.setFont("helvetica", "normal");
    doc.text(item.predicted_disease, 65, 58);
    
    let yPos = 68;
    
    const addSection = (title, content) => {
        doc.setFont("helvetica", "bold");
        doc.text(title, 20, yPos);
        yPos += 7;
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(content, 170);
        doc.text(lines, 20, yPos);
        yPos += (lines.length * 7) + 5;
    };
    
    addSection("Symptoms Logged:", item.symptoms);
    addSection("Recommended Medicines:", item.medicines);
    addSection("Dietary Plan:", item.diet);
    
    // Check if we need a new page for workout
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }
    addSection("Workout Routine:", item.workout);
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("This report is generated by Healthcare AI. Always consult a real doctor.", 20, 280);
    
    doc.save(`medical_report_${item.id}.pdf`);
}

function openDeleteModal(recordId) {
    recordToDelete = recordId;
    document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDeleteModal() {
    recordToDelete = null;
    document.getElementById('deleteModal').classList.add('hidden');
}

async function confirmDelete() {
    if (!recordToDelete) {
        showToast("No record selected for deletion", "error");
        return;
    }
    
    const token = localStorage.getItem('access_token');
    if (!token) {
        showToast("Not authenticated. Please log in again.", "error");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/history/${recordToDelete}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.status === 401) {
            handleTokenExpiry();
            return;
        }
        if (res.ok) {
            showToast("Record deleted successfully", "success");
            closeDeleteModal();
            loadHistory();
        } else {
            const errData = await res.json().catch(() => ({}));
            showToast(errData.detail || "Failed to delete record", "error");
        }
    } catch (err) {
        console.error("Delete error:", err);
        showToast("Server error during deletion", "error");
    }
}

async function loadSymptomsList() {
    try {
        const res = await fetch(`${API_URL}/symptoms`);
        if(res.ok) {
            allAvailableSymptoms = await res.json();
        }
    } catch(err) {
        console.error('Failed to load symptoms', err);
    }
}

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        const btn = document.getElementById('themeToggleBtn');
        if (btn) {
            if (savedTheme === 'dark') {
                btn.innerHTML = '<i data-lucide="sun" style="width: 16px; height: 16px;"></i> Light Mode';
            } else {
                btn.innerHTML = '<i data-lucide="moon" style="width: 16px; height: 16px;"></i> Dark Mode';
            }
        }
    }

    // If we are on dashboard page
    if (window.location.pathname.includes('dashboard.html')) {
        const token = localStorage.getItem('access_token');
        if(!token) {
            window.location.href = 'login.html';
            return;
        }
        fetchUserData();
        loadSymptomsList();
        loadHistory();
    }
    
    // Initialize icons if Lucide is present
    if (window.lucide) {
        lucide.createIcons();
    }
});

// --- UI Enhancements ---
function showSpinner(text = "Loading...") {
    const overlay = document.getElementById('spinnerOverlay');
    const spinnerText = document.getElementById('spinnerText');
    if (overlay) {
        if (spinnerText) spinnerText.innerText = text;
        overlay.classList.add('active');
    }
}

function hideSpinner() {
    const overlay = document.getElementById('spinnerOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

function handleTokenExpiry() {
    showToast("Session expired. Please log in again.", 'error');
    localStorage.removeItem('access_token');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

// --- Dark Mode ---
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update icon
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
        if (newTheme === 'dark') {
            btn.innerHTML = '<i data-lucide="sun" style="width: 16px; height: 16px;"></i> Light Mode';
        } else {
            btn.innerHTML = '<i data-lucide="moon" style="width: 16px; height: 16px;"></i> Dark Mode';
        }
        if (window.lucide) lucide.createIcons();
    }
}
