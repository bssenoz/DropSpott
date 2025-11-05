export default function LoginPage() {
    return (
      <div>
        <h1>Login</h1>
        <form>
          <input type="email" placeholder="Email" /><br/>
          <input type="password" placeholder="Password" /><br/>
          <button type="submit">Login</button>
        </form>
        <p>Henüz hesabın yok mu? <a href="/auth/register">Register</a></p>
      </div>
    );
  }
  