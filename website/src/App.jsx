import { useState } from 'react';
import TopBar from './components/TopBar';
import RolePanel from './components/RolePanel';
import NeuralTopology from './components/NeuralTopology';
import ModelMatrix from './components/ModelMatrix';
import ComputePlan from './components/ComputePlan';
import TelemetryStream from './components/TelemetryStream';
import { roles } from './data/roles';
import { models, gpuConfigs } from './data/models';

function App() {
  const [selectedRole, setSelectedRole] = useState('orchestrator');

  const role = roles.find(r => r.id === selectedRole);

  return (
    <div className="app-shell">
      <TopBar />
      <div className="main-grid">
        <RolePanel
          roles={roles}
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
        />

        <div className="center-column">
          <NeuralTopology role={role} />
          <ModelMatrix models={models} selectedRole={selectedRole} />
        </div>

        <ComputePlan
          gpuConfigs={gpuConfigs}
          selectedRole={selectedRole}
          roles={roles}
        />

        <TelemetryStream />
      </div>
    </div>
  );
}

export default App;
