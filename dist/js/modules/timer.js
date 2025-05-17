class Timer {
	constructor(element) {
		this.timerElement = element;
		this.timezoneInfo = document.querySelector(".timezone-info");
		this.init();
	}

	init() {
		// Отримуємо параметри з data-атрибутів
		const timezoneOffset = parseInt(this.timerElement.dataset.timezone) || 0;
		const endTimeString = this.timerElement.dataset.endtime;

		// Створюємо дату з урахуванням часового поясу
		this.endTime = this.createDateWithTimezone(endTimeString, timezoneOffset);

		this.animationType = this.timerElement.dataset.animation || "down";
		this.endText = this.timerElement.previousElementSibling.dataset.endtext || "Time is up!";

		// Відображаємо інформацію про часовий пояс
		this.displayTimezoneInfo(timezoneOffset);

		// Отримуємо елементи DOM
		this.daysElement = this.timerElement.querySelector(".days");
		this.hoursElement = this.timerElement.querySelector(".hours");
		this.minutesElement = this.timerElement.querySelector(".minutes");
		this.secondsElement = this.timerElement.querySelector(".seconds");
		this.thirdDigitContainer = this.daysElement.querySelector(".third-digit");

		this.updateTimer();
	}

	createDateWithTimezone(dateString, timezoneOffset) {
		// Створюємо дату в локальному часовому поясі
		const localDate = new Date(dateString);

		// Отримуємо поточний часовий пояс користувача (хвилини)
		const userTimezoneOffset = localDate.getTimezoneOffset();

		// Корегуємо дату з урахуванням вказаного часового поясу
		const targetTimezoneOffset = timezoneOffset * 60; // Переводимо години в хвилини
		const timezoneDifference = targetTimezoneOffset + userTimezoneOffset;

		// Створюємо нову дату з урахуванням різниці часових поясів
		const adjustedDate = new Date(localDate.getTime() + timezoneDifference * 60 * 1000);

		return adjustedDate;
	}

	displayTimezoneInfo(timezoneOffset) {
		if (!this.timezoneInfo) return;

		const gmtText = timezoneOffset >= 0 ? `GMT+${timezoneOffset}` : `GMT${timezoneOffset}`;

		const localTime = new Date();
		const userTimezone = -localTime.getTimezoneOffset() / 60;
		const userGmtText = userTimezone >= 0 ? `GMT+${userTimezone}` : `GMT${userTimezone}`;

		this.timezoneInfo.textContent = `(Your timezone: ${userGmtText})`;
	}

	updateDigitGroup(container, newValue, isDays = false) {
		if (!container) return;

		const digitContainers = Array.from(container.querySelectorAll(".digit-container")).filter((container) => container.style.display !== "none");

		const digits = digitContainers.length;
		const formattedValue = String(newValue).padStart(digits, "0");

		if (isDays) {
			const showThirdDigit = newValue > 99;
			this.thirdDigitContainer.style.display = showThirdDigit ? "block" : "none";

			const updatedContainers = Array.from(container.querySelectorAll(".digit-container")).filter((container) => container.style.display !== "none");

			this.updateVisibleDigits(updatedContainers, formattedValue);
		} else {
			this.updateVisibleDigits(digitContainers, formattedValue);
		}
	}

	updateVisibleDigits(containers, formattedValue) {
		const valueLength = formattedValue.length;
		const containersLength = containers.length;

		for (let i = 0; i < containersLength; i++) {
			const container = containers[i];
			const currentDigit = container.querySelector(".digit");
			const digitIndex = valueLength - containersLength + i;
			const newDigitValue = digitIndex >= 0 ? formattedValue[digitIndex] : "0";

			if (!currentDigit || currentDigit.textContent !== newDigitValue) {
				this.animateDigit(container, newDigitValue);
			}
		}
	}

	animateDigit(container, newValue) {
		const currentDigit = container.querySelector(".digit");
		if (!currentDigit) return;

		const newDigit = document.createElement("div");
		newDigit.className = `digit new ${this.animationType}`;
		newDigit.textContent = newValue;

		currentDigit.className = `digit old ${this.animationType}`;
		container.appendChild(newDigit);

		setTimeout(() => {
			if (currentDigit.parentNode === container) {
				container.removeChild(currentDigit);
				newDigit.className = "digit";
			}
		}, 300);
	}

	updateTimer() {
		const now = new Date();
		const timeLeft = this.endTime - now;

		if (timeLeft <= 0) {
			this.timerElement.previousElementSibling.textContent = this.endText;
			this.timerElement.style.display = "none";
			return;
		}

		const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
		const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

		this.updateDigitGroup(this.daysElement, days, true);
		this.updateDigitGroup(this.hoursElement, hours);
		this.updateDigitGroup(this.minutesElement, minutes);
		this.updateDigitGroup(this.secondsElement, seconds);

		setTimeout(() => this.updateTimer(), 1000);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const timerElement = document.querySelector(".timer");
	if (timerElement) {
		new Timer(timerElement);
	}
});
