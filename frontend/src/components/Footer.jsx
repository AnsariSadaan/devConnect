import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
  FaHeart,
  FaCode,
} from "react-icons/fa";
import { FiMail, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { title: 'Product', links: [
      { label: 'Features', path: '/premium' },
      { label: 'Pricing', path: '/premium' },
    ]},
    { title: 'Company', links: [
      { label: 'About', path: '/about' }
    ]},
    { title: 'Support', links: [
      { label: 'Contact', path: '/contact' },
      { label: 'Shipping', path: '/shipping' },
      { label: 'Privacy Policy', path: '/privacy-policy' },
    ]},
  ];

  return (
    <footer className="bg-base-200 border-t border-base-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <FaCode className="text-primary text-2xl" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                DevConnect
              </span>
            </div>
            <p className="text-base-content/70 text-sm leading-relaxed max-w-sm">
              Connect with developers worldwide. Build your network, share knowledge,
              and grow your career in the developer community.
            </p>
            <div className="flex gap-4 mt-4">
              <a
                href="https://github.com/AnsariSadaan"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-base-300 hover:bg-primary/10 transition-colors duration-200"
                aria-label="GitHub"
              >
                <FaGithub className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/sadaan-ansari-82a191214/"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-base-300 hover:bg-primary/10 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/sadaan_18"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-base-300 hover:bg-primary/10 transition-colors duration-200"
                aria-label="Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Link Sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-base-content/70 hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-base-300">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-base-content/60">
              <FaHeart className="text-error text-sm" />
              <span>
                Made with love by{' '}
                <a
                  href="https://github.com/AnsariSadaan"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors duration-200"
                >
                  Sadaan Ansari
                </a>
              </span>
              <span className="hidden sm:inline">•</span>
              <span>© {currentYear} DevConnect</span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <Link
                to="/privacy-policy"
                className="text-base-content/60 hover:text-primary transition-colors duration-200"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-base-content/60 hover:text-primary transition-colors duration-200"
              >
                Terms
              </Link>
              <Link
                to="/contact"
                className="text-base-content/60 hover:text-primary transition-colors duration-200"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;