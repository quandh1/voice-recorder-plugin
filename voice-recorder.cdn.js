
(function (window) {
  window.VoiceRecorderPlugin = {
    init: function(chatInputWrapper, messageInput) {
      if (!chatInputWrapper || !messageInput) return;
      if (chatInputWrapper.querySelector('.voice-record-btn')) return;

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.warn('Trình duyệt không hỗ trợ Web Speech API');
        return;
      }

      const recordButton = document.createElement('button');
      recordButton.className = 'voice-record-btn';
      recordButton.innerHTML = '<i class="fas fa-microphone"></i>';
      recordButton.title = 'Nhấn để ghi âm giọng nói';
      chatInputWrapper.insertBefore(recordButton, messageInput);

      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';

      recordButton.addEventListener('click', () => {
        try {
          recognition.start();
        } catch (e) {
          console.error(e);
        }
      });

      recognition.onresult = function (event) {
        const result = event.results[0][0].transcript;
        messageInput.value = result;
      };
    }
  };
})(window);
