import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeleportPageComponent } from './teleport-page/teleport-page.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { TeleportStepDesignateComponent } from './teleport-step-designate/teleport-step-designate.component';
import { TeleportStepApproveComponent } from './teleport-step-approve/teleport-step-approve.component';
import { TeleportStepSwapComponent } from './teleport-step-swap/teleport-step-swap.component';
import { TeleportStepSuccessComponent } from './teleport-step-success/teleport-step-success.component';

const routes: Routes = [
    { path: '', component: TeleportPageComponent },
    { path: 'designate', component: TeleportStepDesignateComponent },
    { path: 'approval', component:  TeleportStepApproveComponent },
    { path: 'swap', component: TeleportStepSwapComponent },
    { path: 'success', component: TeleportStepSuccessComponent }
]

@NgModule({
    declarations: [
        TeleportPageComponent,
        TeleportStepDesignateComponent,
        TeleportStepApproveComponent,
        TeleportStepSwapComponent,
        TeleportStepSuccessComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes)
    ],
    exports: [

    ]
})
export class TeleportModule { }
