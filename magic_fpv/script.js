const portfolio = document.getElementById("portfolio");

function showportfolio() {
    // Usuń klasę collapsed i dodaj expanding
    portfolio.classList.remove('collapsed');
    portfolio.classList.add('expanding');
    
    const films = `
        <h2 onclick="hide_portfolio()" class="portfolio-title" style="opacity: 0;">Hide portfolio ↑</h2>
        <div class="videos">
            <video width="320" height="180" controls>
                <source src="./videos/Gosia&Grzegorz.mp4" type="video/mp4">
                Your browser does not support the video element
            </video>
            <video width="320" height="180" controls>
                <source src="./videos/Lanzarote_1.mp4" type="video/mp4">
                Your browser does not support the video element
            </video>
            <video width="320" height="180" controls>
                <source src="./videos/Ford-LTD.mp4" type="video/mp4">
                Your browser does not support the video element
            </video>
            <video width="320" height="180" controls>
                <source src="./videos/Lanzarote_2.mp4" type="video/mp4">
                Your browser does not support the video element
            </video>
        </div>
    `;
    
    portfolio.innerHTML = films;
    
    setTimeout(() => {
        const titleH2 = document.querySelector('.portfolio h2');
        const videosDiv = document.querySelector('.videos');
        
        if (titleH2) {
            titleH2.style.opacity = '1';
            titleH2.classList.add('fade-in-title');
        }
        
        if (videosDiv) {
            videosDiv.classList.add('fade-in');
        }
        
        portfolio.classList.remove('expanding');
    }, 100);
}

function hide_portfolio() {
    portfolio.classList.add('collapsing');
    
    const videosDiv = document.querySelector('.videos');
    const titleH2 = document.querySelector('.portfolio h2');
    
    if (titleH2) {
        titleH2.style.transition = 'opacity 0.3s ease';
        titleH2.style.opacity = '0';
    }
    
    if (videosDiv) {
        videosDiv.classList.remove('fade-in');
        videosDiv.classList.add('fade-out');
    }
    
    setTimeout(() => {
        const hide_films = '<h2 onclick="showportfolio()" class="portfolio-title fade-in-title">A few of our projects ↓</h2>';
        portfolio.innerHTML = hide_films;
        portfolio.classList.remove('collapsing');
        portfolio.classList.add('collapsed'); // Dodaj klasę collapsed
    }, 550);
}