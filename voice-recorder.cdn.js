window.VoiceRecorderPlugin = (function () {
    const defaultLang = 'vi-VN';
    const langOptions = [
        { code: 'vi-VN', name: 'Tiếng Việt' },
        { code: 'en-US', name: 'English (US)' },
        { code: 'en-GB', name: 'English (UK)' },
        { code: 'zh-CN', name: '中文 (简体)' },
        { code: 'ja-JP', name: '日本語' },
        { code: 'ko-KR', name: '한국어' }
    ];

    function init(chatInputWrapper, messageInput) {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            console.warn('Trình duyệt không hỗ trợ speech recognition.');
            return;
        }

        if (chatInputWrapper.querySelector('.voice-record-btn')) return;

        const recordButton = document.createElement('button');
        recordButton.className = 'voice-record-btn';
        recordButton.innerHTML = '<i class="fas fa-microphone"></i>';
        recordButton.title = 'Ghi âm';

        const recordingStatus = document.createElement('div');
        recordingStatus.className = 'recording-status';
        recordingStatus.innerHTML = 'Đang ghi âm...';

        const waveAnimation = document.createElement('div');
        waveAnimation.className = 'recording-wave';
        for (let i = 0; i < 5; i++) {
            const bar = document.createElement('div');
            bar.className = 'wave-bar';
            waveAnimation.appendChild(bar);
        }

        const languageSelector = document.createElement('div');
        languageSelector.className = 'language-selector';

        const dropdownLabel = document.createElement('label');
        dropdownLabel.textContent = 'Ngôn ngữ: ';

        const languageDropdown = document.createElement('select');
        languageDropdown.className = 'language-dropdown';

        langOptions.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.textContent = lang.name;
            languageDropdown.appendChild(option);
        });

        const savedLang = localStorage.getItem('speech_recognition_lang') || defaultLang;
        languageDropdown.value = savedLang;

        dropdownLabel.appendChild(languageDropdown);
        languageSelector.appendChild(dropdownLabel);

        recordingStatus.appendChild(waveAnimation);
        recordingStatus.appendChild(languageSelector);

        chatInputWrapper.insertBefore(recordButton, messageInput);
        chatInputWrapper.parentElement.appendChild(recordingStatus);

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = savedLang;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;

        languageDropdown.addEventListener('change', function () {
            recognition.lang = this.value;
            localStorage.setItem('speech_recognition_lang', this.value);
        });

        let isRecording = false;
        let recognitionTimeout;

        recognition.onresult = function (event) {
            messageInput.value = event.results[0][0].transcript;

            clearTimeout(recognitionTimeout);
            recognitionTimeout = setTimeout(() => {
                if (isRecording) recognition.stop();
            }, 2000);
        };

        recognition.onstart = function () {
            recordButton.classList.add('recording');
            recordingStatus.classList.add('active');
            isRecording = true;

            recognitionTimeout = setTimeout(() => {
                if (isRecording) recognition.stop();
            }, 7000);
        };

        recognition.onend = function () {
            recordButton.classList.remove('recording');
            recordingStatus.classList.remove('active');
            isRecording = false;
            clearTimeout(recognitionTimeout);
        };

        recognition.onerror = function (event) {
            console.error('Lỗi ghi âm:', event.error);
            recordButton.classList.remove('recording');
            recordingStatus.classList.remove('active');
            isRecording = false;
        };

        recordButton.addEventListener('click', function () {
            if (isRecording) {
                recognition.stop();
            } else {
                messageInput.value = '';
                try {
                    recognition.start();
                } catch (error) {
                    console.error('Không thể bắt đầu ghi âm:', error);
                }
            }
        });
    }

    return { init };
})();
