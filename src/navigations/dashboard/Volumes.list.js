import React from 'react';

const VolumeList = ({ goldDetails }) => {
  return (
    <div className="container-list">
      <div className="cardHeader">
        <h2>Volume By Date</h2>
      </div>
      <table>
        <tbody>
          {/* Limit rows to 8 using slice */}
          {Object.entries(goldDetails.volumes["GC=F"]).slice(0, 5).map(([date, volume]) => (
            <tr key={date}>
              <td width="60px">
                <div className="imgBx">
                  <img src="https://cdn-icons-png.flaticon.com/512/1473/1473504.png" alt="customer" />
                </div>
              </td>
              <td>
                <h4>{date} <br /><span>{volume}</span></h4>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VolumeList;
