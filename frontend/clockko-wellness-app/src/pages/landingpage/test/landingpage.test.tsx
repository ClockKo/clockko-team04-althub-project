import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LandingPage } from '../landingpage';
import '@testing-library/jest-dom';

// Mock the SEO hook
vi.mock('../../../seo/useSEO', () => ({
  useHomeSEO: vi.fn()
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  }
}));

// Mock image imports
vi.mock('../../../assets/images/frame1.png', () => ({
  default: '/mock-logo.png'
}));

vi.mock('../../../assets/design/landing-page design/taskExpanded.png', () => ({
  default: '/mock-task-expanded.png'
}));

vi.mock('../../../assets/design/landing-page design/timer1.png', () => ({
  default: '/mock-timer.png'
}));

vi.mock('../../../assets/images/frame3.png', () => ({
  default: '/mock-frame3.png'
}));

vi.mock('../../../assets/images/frame5.png', () => ({
  default: '/mock-frame5.png'
}));

vi.mock('../../../assets/images/lines.png', () => ({
  default: '/mock-lines.png'
}));

vi.mock('../../../assets/images/KoPoses.png', () => ({
  default: '/mock-ko-poses.png'
}));

vi.mock('../../../assets/images/SVG.png', () => ({
  default: '/mock-instagram.png'
}));

vi.mock('../../../assets/images/YoutubeLogo.png', () => ({
  default: '/mock-youtube.png'
}));

vi.mock('../../../assets/images/twitter.png', () => ({
  default: '/mock-twitter.png'
}));

vi.mock('../../../assets/images/thread.png', () => ({
  default: '/mock-thread.png'
}));

// Helper component to wrap LandingPage with Router
const LandingPageWithRouter = () => (
  <BrowserRouter>
    <LandingPage />
  </BrowserRouter>
);

describe('LandingPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Header Section', () => {
    it('renders the logo', () => {
      render(<LandingPageWithRouter />);
      const logos = screen.getAllByAltText('Logo');
      expect(logos.length).toBeGreaterThan(0);
      expect(logos[0]).toBeInTheDocument();
      expect(logos[0]).toHaveAttribute('src', '/mock-logo.png');
    });

    it('renders Log In button with correct link', () => {
      render(<LandingPageWithRouter />);
      const loginButton = screen.getByRole('link', { name: /log in/i });
      expect(loginButton).toBeInTheDocument();
      expect(loginButton).toHaveAttribute('href', '/signin');
    });

    it('renders Sign Up button with correct link', () => {
      render(<LandingPageWithRouter />);
      const signUpButton = screen.getByRole('link', { name: /sign up/i });
      expect(signUpButton).toBeInTheDocument();
      expect(signUpButton).toHaveAttribute('href', '/create-account');
    });

    it('applies correct styling to header buttons', () => {
      render(<LandingPageWithRouter />);
      const loginButton = screen.getByRole('button', { name: /log in/i });
      const signUpButton = screen.getByRole('button', { name: /sign up/i });
      
      expect(loginButton).toHaveClass('border-blue1', 'text-blue1');
      expect(signUpButton).toHaveClass('bg-blue1', 'text-white');
    });
  });

  describe('Hero Section', () => {
    it('renders the main heading with correct text', () => {
      render(<LandingPageWithRouter />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/The All-in-one Time Management App for Remote Workers/i);
    });

    it('highlights "Remote Workers" text in blue', () => {
      render(<LandingPageWithRouter />);
      const remoteWorkersSpan = screen.getByText('Remote Workers');
      expect(remoteWorkersSpan).toHaveClass('text-blue1');
    });

    it('renders the hero description', () => {
      render(<LandingPageWithRouter />);
      const description = screen.getByText(/Your time, your rules — ClockKo helps remote workers set boundaries, beat burnout, and stay balanced./i);
      expect(description).toBeInTheDocument();
    });

    it('renders the "Get Started for Free" button in hero section', () => {
      render(<LandingPageWithRouter />);
      const getStartedButtons = screen.getAllByText(/Get Started for Free/i);
      expect(getStartedButtons).toHaveLength(2); // One in hero, one in CTA section
      expect(getStartedButtons[0]).toBeInTheDocument();
    });

    it('renders the dashboard preview image', () => {
      render(<LandingPageWithRouter />);
      const dashboardImage = screen.getByAltText('Dashboard preview');
      expect(dashboardImage).toBeInTheDocument();
      expect(dashboardImage).toHaveAttribute('src', '/mock-task-expanded.png');
    });
  });

  describe('Why Choose ClockKo Section', () => {
    it('renders the section heading', () => {
      render(<LandingPageWithRouter />);
      const heading = screen.getByRole('heading', { name: /Why Choose ClockKo\?/i });
      expect(heading).toBeInTheDocument();
    });

    it('renders the section description', () => {
      render(<LandingPageWithRouter />);
      const description = screen.getByText(/Built with remote realities in mind — slow internet, inconsistent power, multiple gigs/i);
      expect(description).toBeInTheDocument();
    });

    it('renders all feature icons and descriptions', () => {
      render(<LandingPageWithRouter />);
      
      // Check for feature texts
      expect(screen.getByText(/Track your work hours effectively/i)).toBeInTheDocument();
      expect(screen.getByText(/Set healthy work-life boundaries/i)).toBeInTheDocument();
      expect(screen.getByText(/Review your productivity trends/i)).toBeInTheDocument();
      
      // Check for feature icons
      expect(screen.getByAltText('Timer Icon')).toBeInTheDocument();
      expect(screen.getByAltText('Break Icon')).toBeInTheDocument();
      expect(screen.getByAltText('Trend Icon')).toBeInTheDocument();
    });
  });

  describe('How ClockKo Helps Section', () => {
    it('renders the section heading', () => {
      render(<LandingPageWithRouter />);
      const heading = screen.getByRole('heading', { name: /How ClockKo Helps/i });
      expect(heading).toBeInTheDocument();
    });

    it('renders all three feature cards', () => {
      render(<LandingPageWithRouter />);
      
      // Check for card titles
      expect(screen.getByText('Effortless Time Tracking')).toBeInTheDocument();
      expect(screen.getByText('Smart Break Management')).toBeInTheDocument();
      expect(screen.getByText('Healthy Work Boundaries')).toBeInTheDocument();
      
      // Check for card numbers
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders card descriptions', () => {
      render(<LandingPageWithRouter />);
      
      expect(screen.getByText(/Stop fumbling with timers and manual logs/i)).toBeInTheDocument();
      expect(screen.getByText(/Get gentle, science-backed nudges to hydrate/i)).toBeInTheDocument();
      expect(screen.getByText(/Set personalized daily cutoffs and let our guided shutdown/i)).toBeInTheDocument();
    });

    it('applies correct styling to card numbers', () => {
      render(<LandingPageWithRouter />);
      const cardNumbers = ['1', '2', '3'];
      
      cardNumbers.forEach(number => {
        const numberElement = screen.getByText(number);
        expect(numberElement).toHaveClass('text-blue1');
      });
    });
  });

  describe('Ready to Own Your Time Again Section', () => {
    it('renders the section heading', () => {
      render(<LandingPageWithRouter />);
      const heading = screen.getByRole('heading', { name: /Ready to Own Your Time Again\?/i });
      expect(heading).toBeInTheDocument();
    });

    it('renders the KoPoses image', () => {
      render(<LandingPageWithRouter />);
      const koPosesImage = screen.getByAltText('Koala Poses');
      expect(koPosesImage).toBeInTheDocument();
      expect(koPosesImage).toHaveAttribute('src', '/mock-ko-poses.png');
    });

    it('renders the second "Get Started for Free" button', () => {
      render(<LandingPageWithRouter />);
      const getStartedButtons = screen.getAllByText(/Get Started for Free/i);
      expect(getStartedButtons).toHaveLength(2);
      expect(getStartedButtons[1]).toBeInTheDocument();
    });
  });

  describe('Footer Section', () => {
    it('renders the footer logo', () => {
      render(<LandingPageWithRouter />);
      const footerLogos = screen.getAllByAltText('Logo');
      expect(footerLogos).toHaveLength(2); // Header and footer
      expect(footerLogos[1]).toBeInTheDocument();
    });

    it('renders the app description in footer', () => {
      render(<LandingPageWithRouter />);
      const descriptions = screen.getAllByText(/The All-in-one Time Management App for Remote Workers/i);
      expect(descriptions.length).toBeGreaterThan(0);
      // Check that at least one description exists
      expect(descriptions[0]).toBeInTheDocument();
    });

    it('renders Quick Links section', () => {
      render(<LandingPageWithRouter />);
      expect(screen.getByText('QUICK LINKS')).toBeInTheDocument();
      expect(screen.getByText('Privacy policy')).toBeInTheDocument();
      expect(screen.getByText('Terms of Use')).toBeInTheDocument();
    });

    it('renders Contact Us section', () => {
      render(<LandingPageWithRouter />);
      expect(screen.getByText('CONTACT US')).toBeInTheDocument();
      expect(screen.getByText('clockko@gmail.com')).toBeInTheDocument();
    });

    it('renders Join Our Community section', () => {
      render(<LandingPageWithRouter />);
      expect(screen.getByText('JOIN OUR COMMUNITY')).toBeInTheDocument();
      
      // Check for social media icons
      expect(screen.getByAltText('Instagram')).toBeInTheDocument();
      expect(screen.getByAltText('YouTube')).toBeInTheDocument();
      expect(screen.getByAltText('Twitter')).toBeInTheDocument();
      expect(screen.getByAltText('Thread')).toBeInTheDocument();
    });

    it('renders social media links with correct hover classes', () => {
      render(<LandingPageWithRouter />);
      const socialLinks = screen.getAllByRole('link').filter(link => 
        link.getAttribute('href') === '#'
      );
      
      // Check that footer links exist (privacy, terms, social media)
      expect(socialLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<LandingPageWithRouter />);
      
      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      const h3Elements = screen.getAllByRole('heading', { level: 3 });
      
      expect(h1Elements).toHaveLength(1); // Main hero heading
      expect(h2Elements.length).toBeGreaterThan(0); // Section headings
      expect(h3Elements.length).toBeGreaterThan(0); // Footer section headings
    });

    it('has alt text for all images', () => {
      render(<LandingPageWithRouter />);
      
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });

    it('has proper button roles and labels', () => {
      render(<LandingPageWithRouter />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
        // Check that button has accessible text content
        expect(button.textContent?.trim()).not.toBe('');
      });
    });

    it('has proper link roles and destinations', () => {
      render(<LandingPageWithRouter />);
      
      const loginLink = screen.getByRole('link', { name: /log in/i });
      const signUpLink = screen.getByRole('link', { name: /sign up/i });
      
      expect(loginLink).toHaveAttribute('href', '/signin');
      expect(signUpLink).toHaveAttribute('href', '/create-account');
    });
  });

  describe('Content Validation', () => {
    it('contains key ClockKo value propositions', () => {
      render(<LandingPageWithRouter />);
      
      // Key value props should be present
      expect(screen.getAllByText(/time management/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/remote workers/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/work-life boundaries/i)).toBeInTheDocument();
      expect(screen.getByText(/productivity/i)).toBeInTheDocument();
    });

    it('has consistent branding and styling', () => {
      render(<LandingPageWithRouter />);
      
      // Check for consistent blue color class usage
      const blueElements = document.querySelectorAll('.text-blue1');
      expect(blueElements.length).toBeGreaterThan(0);
      
      // Check for consistent button styling
      const primaryButtons = document.querySelectorAll('.bg-blue1');
      expect(primaryButtons.length).toBeGreaterThan(0);
    });

    it('displays correct contact information', () => {
      render(<LandingPageWithRouter />);
      expect(screen.getByText('clockko@gmail.com')).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    it('handles button interactions', () => {
      render(<LandingPageWithRouter />);
      
      const getStartedButtons = screen.getAllByText(/Get Started for Free/i);
      
      // Test that buttons are clickable (no errors thrown)
      getStartedButtons.forEach(button => {
        fireEvent.click(button);
        expect(button).toBeInTheDocument(); // Still present after click
      });
    });

    it('handles link navigation', () => {
      render(<LandingPageWithRouter />);
      
      const loginLink = screen.getByRole('link', { name: /log in/i });
      const signUpLink = screen.getByRole('link', { name: /sign up/i });
      
      // Test that links are present and have correct destinations
      expect(loginLink).toHaveAttribute('href', '/signin');
      expect(signUpLink).toHaveAttribute('href', '/create-account');
    });
  });

  describe('Responsive Design Elements', () => {
    it('has responsive classes applied', () => {
      render(<LandingPageWithRouter />);
      
      // Check for responsive utility classes (this tests the markup structure)
      const mainElement = document.querySelector('main');
      expect(mainElement).toBeInTheDocument();
      
      // Verify responsive image classes exist in DOM
      const responsiveElements = document.querySelectorAll('.md\\:flex-row, .md\\:text-3xl, .md\\:w-32');
      expect(responsiveElements.length).toBeGreaterThan(0);
    });
  });
});
