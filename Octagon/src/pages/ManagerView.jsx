/**
 * Manager View Component
 * Dashboard interface for restaurant managers to manage inventory
 * Displays inventory items with stock levels and status indicators
 */

// Mock inventory data for demonstration purposes
// In a real application, this would come from an API or database
const mockInventory = [
  { id: 101, item: 'Tapioca Pearls', stock: '15 lbs', status: 'Good' },
  { id: 102, item: 'Black Tea Leaves', stock: '2 lbs', status: 'Low' },
  { id: 103, item: 'Whole Milk', stock: '10 gal', status: 'Good' },
  { id: 104, item: 'Taro Powder', stock: '0.5 lbs', status: 'Reorder' },
];

/**
 * ManagerView component - inventory management dashboard
 * Provides interface for managers to view and manage restaurant inventory
 */
export default function ManagerView() {
  return (
    // Main container with padding and max-width for responsive design
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Dashboard title */}
      <h1>Manager Dashboard</h1>
      {/* Subtitle describing the current section */}
      <p style={{ color: '#666', marginBottom: '20px' }}>Inventory Management</p>
      
      {/* Inventory table with full width and collapsed borders */}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        {/* Table header with gray background */}
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '12px' }}>ID</th>
            <th style={{ padding: '12px' }}>Item Name</th>
            <th style={{ padding: '12px' }}>Current Stock</th>
            <th style={{ padding: '12px' }}>Status</th>
            <th style={{ padding: '12px' }}>Actions</th>
          </tr>
        </thead>
        {/* Table body with inventory data */}
        <tbody>
          {mockInventory.map((row) => (
            // Table row with unique key and bottom border
            <tr key={row.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{row.id}</td>
              <td style={{ padding: '12px' }}>{row.item}</td>
              <td style={{ padding: '12px' }}>{row.stock}</td>
              {/* Status cell with conditional styling for reorder items */}
              <td style={{ padding: '12px', color: row.status === 'Reorder' ? 'red' : 'inherit' }}>
                <strong>{row.status}</strong>
              </td>
              {/* Actions cell with update button */}
              <td style={{ padding: '12px' }}>
                <button style={{ padding: '6px 12px', cursor: 'pointer' }}>Update</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}