import '../css/Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <p className="footer-text">摄影论坛</p>
                <p className="footer-subtext">捕捉每一个精彩瞬间，与摄影爱好者分享灵感</p>
                <div className="footer-social">
                    <a href="#" className="social-link">微博</a>
                    <a href="#" className="social-link">微信</a>
                    <a href="#" className="social-link">Instagram</a>
                </div>
            </div>
        </footer>
    );
}