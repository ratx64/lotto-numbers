export const Copyright = () => {
  const currYear = new Date().getFullYear();

  return (
    <section className="copyright">
      <a className="copyright__link" href="mailto:contact@yourmom.com">
        contact@yourmom.com
      </a>
      <p className="copyright__text">
        (c) {currYear} Your Mom. All rights reserved.
      </p>
    </section>
  );
};
