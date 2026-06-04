import {
  getMetadata,
  isAdobeHubPage,
  isIndexHomePage,
  isLandingPage,
} from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/** On landing, drop Adobe Hub from nav (path or label). */
function removeAdobeHubLinksFromNavTitle(navTitle) {
  if (!navTitle) return;
  navTitle.querySelectorAll('a[href]').forEach((a) => {
    let path = '';
    try {
      path = new URL(a.href, window.location).pathname;
    } catch {
      return;
    }
    const label = a.textContent.trim().toLowerCase();
    if (!path.includes('adobe-hub') && label !== 'adobe hub') return;
    const li = a.closest('li');
    if (li) {
      li.remove();
    } else {
      a.remove();
    }
  });
}

function appendHeaderUserChip(navTools) {
  const userButton = document.createElement('button');
  userButton.className = 'dropdown-button nav-header-user';
  userButton.setAttribute('type', 'button');
  userButton.setAttribute('aria-label', 'Signed in user');
  userButton.innerHTML = `
    <span class="nav-header-user-icon" aria-hidden="true">
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" fill="currentColor"/>
        <path d="M10 12C5.58172 12 2 14.2386 2 17V20H18V17C18 14.2386 14.4183 12 10 12Z" fill="currentColor"/>
      </svg>
    </span>
    <span class="nav-header-user-name">Matt Quinn</span>
  `;
  navTools.appendChild(userButton);
}

/**
 * Loads and decorates the header with Sky gradient bar and two-row layout
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';

  // Create top row container
  const topRow = document.createElement('div');
  topRow.className = 'nav-top-row';

  // Tools: Hub + index/home → user chip; landing → Login; else Clubs
  const navTools = document.createElement('div');
  navTools.className = 'nav-tools';

  if (isAdobeHubPage() || isIndexHomePage()) {
    appendHeaderUserChip(navTools);
  } else if (isLandingPage()) {
    const loginLink = document.createElement('a');
    loginLink.className = 'dropdown-button nav-header-login';
    const base = (window.hlx?.codeBasePath || '').replace(/\/$/, '');
    loginLink.href = base ? `${base}/` : '/';
    loginLink.textContent = 'Login';
    navTools.appendChild(loginLink);
  } else {
    const clubsButton = document.createElement('button');
    clubsButton.className = 'dropdown-button';
    clubsButton.setAttribute('type', 'button');
    clubsButton.innerHTML = `
      Clubs
      <svg class="dropdown-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none"/>
      </svg>
    `;
    navTools.appendChild(clubsButton);
  }

  // Add title from first fragment section to top row
  if (fragment && fragment.children.length > 0) {
    const sections = [...fragment.children];

    // First section contains title
    if (sections[0]) {
      const titleSection = sections[0];
      titleSection.classList.add('nav-title');
      if (isLandingPage()) {
        removeAdobeHubLinksFromNavTitle(titleSection);
      }
      topRow.appendChild(titleSection);
    }
  }

  // Assemble top row (title + tools)
  topRow.appendChild(navTools);
  nav.appendChild(topRow);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // Add click handlers to navigation links for border-bottom effect
  const navLinks = nav.querySelectorAll('.nav-title a:any-link');
  navLinks.forEach((link) => {
    // Check if link is active based on current URL
    const linkPath = new URL(link.href, window.location).pathname;
    const currentPath = window.location.pathname;
    if (linkPath === currentPath || currentPath.startsWith(linkPath + '/')) {
      link.classList.add('active');
    }

    // Add click handler
    link.addEventListener('click', () => {
      // Remove active class from all links
      navLinks.forEach((l) => l.classList.remove('active', 'clicked'));
      // Add clicked class to the clicked link
      link.classList.add('clicked');
      
      // Store in sessionStorage to persist across page loads
      sessionStorage.setItem('activeNavLink', link.href);
    });
  });

  // Restore clicked state from sessionStorage
  const activeNavLink = sessionStorage.getItem('activeNavLink');
  if (activeNavLink) {
    navLinks.forEach((link) => {
      if (link.href === activeNavLink) {
        link.classList.add('clicked');
      }
    });
  }
}
