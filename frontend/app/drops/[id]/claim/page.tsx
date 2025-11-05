export default function ClaimPage({ params }: { params: { id: string } }) {
    return (
      <div>
        <h1>Claim Window (Drop ID: {params.id})</h1>
        <p>Hak kazandıysan claim kodun burada görünecek</p>
        <button>Claim Now</button>
      </div>
    );
  }
  