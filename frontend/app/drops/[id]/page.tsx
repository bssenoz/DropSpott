export default function DropDetailPage({ params }: { params: { id: string } }) {
    return (
      <div>
        <h1>Drop Detayı (ID: {params.id})</h1>
        <p>Bu sayfada drop hakkında bilgiler görünecek.</p>
        <button>Join Waitlist</button>
        <button>Leave Waitlist</button>
        <p><a href={`/drops/${params.id}/claim`}>Claim sayfasına git →</a></p>
      </div>
    );
  }
  