// Components
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import PageLayout from "@/components/PageLayout";

const CookiePolicy = () => {
  return (
    <PageLayout>
      <MaxWidthWrapper>
        <div className="my-16 flex flex-col gap-y-4">
          <h2 className="text-4xl font-bold">Cookie Policy</h2>
          <p className="max-w-2xl text-lg">
            This is the Cookie Policy for CleanupHub, accessible from
            https://www.cleanup-hub.vercel.app
          </p>
          <h2 className="text-2xl font-semibold">What Are Cookies</h2>
          <p className="max-w-2xl text-lg">
            As is common practice with almost all professional websites this
            site uses cookies, which are tiny files that are downloaded to your
            computer, to improve your experience. This page describes what
            information they gather, how we use it and why we sometimes need to
            store these cookies. We will also share how you can prevent these
            cookies from being stored however this may downgrade or
            &apos;break&apos; certain elements of the site&apos;s functionality.
          </p>
          <h2 className="text-2xl font-semibold">How We Use Cookies</h2>
          <p className="max-w-2xl text-lg">
            We use cookies for a variety of reasons detailed below.
            Unfortunately, in most cases, there are no industry standard options
            for disabling cookies without completely disabling the functionality
            and features they add to this site. It is recommended that you leave
            on all cookies if you are not sure whether you need them or not in
            case they are used to provide a service that you use.
          </p>
          <h2 className="text-2xl font-semibold">Disabling Cookies</h2>
          <p className="max-w-2xl text-lg">
            You can prevent the setting of cookies by adjusting the settings on
            your browser (see your browser Help for how to do this). Be aware
            that disabling cookies will affect the functionality of this and
            many other websites that you visit. Disabling cookies will usually
            result in also disabling certain functionality and features of this
            site. Therefore it is recommended that you do not disable cookies.
          </p>
          <h2 className="text-2xl font-semibold">The Cookies We Set</h2>
          <ul className="max-w-2xl text-lg">
            <li>
              <strong>Account related cookies</strong>
              <p>
                If you create an account with us then we will use cookies for
                the management of the signup process and general administration.
                These cookies will usually be deleted when you log out however
                in some cases they may remain afterwards to remember your site
                preferences when logged out.
              </p>
            </li>
            <li>
              <strong>Login related cookies</strong>
              <p>
                We use cookies when you are logged in so that we can remember
                this fact. This prevents you from having to log in every single
                time you visit a new page. These cookies are typically removed
                or cleared when you log out to ensure that you can only access
                restricted features and areas when logged in.
              </p>
            </li>
            {/* <li>
              <strong>Email newsletters related cookies</strong>
              <p>
                This site offers newsletter or email subscription services and
                cookies may be used to remember if you are already registered
                and whether to show certain notifications which might only be
                valid to subscribed/unsubscribed users.
              </p>
            </li> */}
          </ul>
          <h2 className="text-2xl font-semibold">More Information</h2>
          <p className="max-w-2xl text-lg">
            Hopefully that has clarified things for you and as was previously
            mentioned if there is something that you aren&apos;t sure whether
            you need or not it&apos;s usually safer to leave cookies enabled in
            case it does interact with one of the features you use on our site.
          </p>
        </div>
      </MaxWidthWrapper>
    </PageLayout>
  );
};

export default CookiePolicy;
