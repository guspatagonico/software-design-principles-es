(function () {
	let currentTab = 0;
	let totalTabs = 0;
	const nav = document.getElementById('nav');

	if (!nav) return;

	const tabBtns = nav.querySelectorAll('.tab-btn');
	totalTabs = tabBtns.length;

	const pill = document.getElementById('navPill');
	const btnPrev = document.getElementById('btnPrev');
	const btnNext = document.getElementById('btnNext');

	function movePill(idx) {
		if (!pill || !tabBtns[idx]) return;
		pill.style.left = tabBtns[idx].offsetLeft + 'px';
		pill.style.width = tabBtns[idx].offsetWidth + 'px';
	}

	function show(idx) {
		if (idx < 0 || idx >= totalTabs) return;

		document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
		tabBtns.forEach(b => b.classList.remove('active'));
		document.querySelectorAll('.prog-dot').forEach((d, i) => d.classList.toggle('active', i === idx));

		const panel = document.getElementById('panel-' + idx);
		if (panel) panel.classList.add('active');
		tabBtns[idx].classList.add('active');

		currentTab = idx;
		movePill(idx);

		if (btnPrev) {
			btnPrev.style.opacity = idx === 0 ? '.3' : '1';
			btnPrev.style.pointerEvents = idx === 0 ? 'none' : 'auto';
		}
		if (btnNext) {
			btnNext.style.opacity = idx === totalTabs - 1 ? '.3' : '1';
			btnNext.style.pointerEvents = idx === totalTabs - 1 ? 'none' : 'auto';
		}
	}

	function navigate(dir) {
		show(Math.max(0, Math.min(totalTabs - 1, currentTab + dir)));
	}

	tabBtns.forEach((btn, i) => {
		btn.addEventListener('click', () => show(i));
	});

	document.querySelectorAll('.prog-dot').forEach((dot, i) => {
		dot.addEventListener('click', () => show(i));
	});

	if (btnPrev) btnPrev.addEventListener('click', () => navigate(-1));
	if (btnNext) btnNext.addEventListener('click', () => navigate(1));

	window.addEventListener('resize', () => movePill(currentTab));
	document.addEventListener('keydown', e => {
		if (e.key === 'ArrowRight') navigate(1);
		if (e.key === 'ArrowLeft')  navigate(-1);
	});

	show(0);
	movePill(0);
})();
