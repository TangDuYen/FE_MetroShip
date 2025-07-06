import React from 'react'
import "./ProgressChart.scss"
import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';

function ProgressChart() {
     const mainScore = 7800;
  const orders = 4861;
  const returns = 120;

  const progressList = [
    { label: "Vận chuyển đúng hạn", value: 87, color: "#3b82f6" },
    { label: "Tỉ lệ hài lòng", value: 42, color: "#22c55e" },
  ];
  return (
     <div className="sales-record-card">
      <h4>Chỉ số hoạt động</h4>

      <div className="top-section">
        <div className="circle-chart">
          <CircularProgressbarWithChildren
            value={(mainScore / 10000) * 100}
            styles={buildStyles({
              pathColor: "#a855f7",
              trailColor: "#e5e7eb",
            })}
          >
            <div className="score-text">
              <div className="score">{(mainScore / 1000).toFixed(3)}</div>
              
              <div className="label">Chỉ số</div>
            </div>
          </CircularProgressbarWithChildren>
        </div>

        <div className="stats">
          <div>
            <span className="label">Đơn hàng</span>
            <span className="value">{orders.toLocaleString()}</span>
          </div>
          <div>
            <span className="label">Hoàn đơn</span>
            <span className="value">{returns.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="progress-section">
        {progressList.map((item, i) => (
          <div className="progress-item" key={i}>
            <div className="row">
              <span>{item.label}</span>
              <span>{item.value}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="fill"
                style={{
                  width: `${item.value}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProgressChart