/**
 * Login form block (username, password, submit). On valid submit, navigates to site root.
 * Still dispatches `login-submit` for optional listeners before navigation.
 * @param {Element} block
 */
export default function decorate(block) {
  const suffix = block.id || `login-${Math.random().toString(36).slice(2, 10)}`;
  const fieldId = (name) => `login-${name}-${suffix}`;

  block.textContent = '';

  const form = document.createElement('form');
  form.className = 'login-form';
  form.setAttribute('novalidate', '');

  const userWrap = document.createElement('div');
  userWrap.className = 'login-field';
  const userLabel = document.createElement('label');
  userLabel.className = 'login-label';
  const userId = fieldId('username');
  userLabel.htmlFor = userId;
  userLabel.textContent = 'Username';
  const userInput = document.createElement('input');
  userInput.className = 'login-input';
  userInput.id = userId;
  userInput.name = 'username';
  userInput.type = 'text';
  userInput.autocomplete = 'username';
  userInput.required = true;
  userWrap.append(userLabel, userInput);

  const passWrap = document.createElement('div');
  passWrap.className = 'login-field';
  const passLabel = document.createElement('label');
  passLabel.className = 'login-label';
  const passId = fieldId('password');
  passLabel.htmlFor = passId;
  passLabel.textContent = 'Password';
  const passInput = document.createElement('input');
  passInput.className = 'login-input';
  passInput.id = passId;
  passInput.name = 'password';
  passInput.type = 'password';
  passInput.autocomplete = 'current-password';
  passInput.required = true;
  passWrap.append(passLabel, passInput);

  const actions = document.createElement('div');
  actions.className = 'login-actions';
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'login-submit';
  submitBtn.textContent = 'Login';
  actions.appendChild(submitBtn);

  form.append(userWrap, passWrap, actions);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    form.dispatchEvent(
      new CustomEvent('login-submit', {
        bubbles: true,
        detail: {
          username: userInput.value,
          password: passInput.value,
        },
      }),
    );
    const base = (window.hlx?.codeBasePath || '').replace(/\/$/, '');
    const rootUrl = base ? `${base}/` : '/';
    window.location.assign(rootUrl);
  });

  block.appendChild(form);
}
