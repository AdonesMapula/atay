import React from "react";

function TixMonitor() {
  const soldTickets = [
    {
      name: "Cristian Ludivese",
      email: "cristian@gmail.com",
      contact: "09978751242",
      quantity: 1,
      payment: "Cash",
    },
    // Add more sample data if needed
  ];

  return (
    <div className="h-screen bg-black text-white flex flex-col items-center py-10 px-4">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">Sold Tickets Management</h1>

      {/* Sold Tickets Table */}
      <div className="w-full max-w-4xl overflow-x-auto">
        <table className="w-full border border-white text-white">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border px-4 py-2">Sold to</th>
              <th className="border px-4 py-2">Email Add</th>
              <th className="border px-4 py-2">Contact</th>
              <th className="border px-4 py-2">Quantity</th>
              <th className="border px-4 py-2">Payment Method</th>
            </tr>
          </thead>
          <tbody>
            {soldTickets.map((ticket, index) => (
              <tr key={index} className="text-center bg-gray-900">
                <td className="border px-4 py-2">{ticket.name}</td>
                <td className="border px-4 py-2">{ticket.email}</td>
                <td className="border px-4 py-2">{ticket.contact}</td>
                <td className="border px-4 py-2">{ticket.quantity}</td>
                <td className="border px-4 py-2">{ticket.payment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TixMonitor;
