import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiFacebook } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">MedConnect</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Connecting patients with the right healthcare professionals for better health outcomes.
            </p>
            <div className="flex mt-6 space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <span className="sr-only">GitHub</span>
                <FiGithub className="h-6 w-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <span className="sr-only">Twitter</span>
                <FiTwitter className="h-6 w-6" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <span className="sr-only">LinkedIn</span>
                <FiLinkedin className="h-6 w-6" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <span className="sr-only">Facebook</span>
                <FiFacebook className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Platform
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/doctors" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link to="/specialties" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  Specialties
                </Link>
              </li>
              <li>
                <Link to="/teleconsult" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  Teleconsultation
                </Link>
              </li>
              <li>
                <Link to="/clinics" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  Clinics
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/about" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/privacy" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="text-base text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            &copy; {currentYear} MedConnect. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
            MedConnect is an open-source project. The information provided is not medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
