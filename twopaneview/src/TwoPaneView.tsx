import React, {Fragment, Component} from 'react';
import { View, StyleSheet } from 'react-native';
import { DualScreenInfo, DualScreenInfoPayload, DeviceOrientation } from 'react-native-dualscreeninfo'
import {Orientation, PanePriority, PaneMode} from "./types"

type State = {
  spanning: boolean, 
  orientation: DeviceOrientation,
}

export interface TwoPaneViewProps {
  panePriority: PanePriority,
  paneMode: PaneMode,
}

export class TwoPaneView extends Component<TwoPaneViewProps, State> {
  state: State = {
    spanning: DualScreenInfo.isSpanning, 
    orientation: DualScreenInfo.orientation,
  };

  getPanePriority() {
    return this.props.panePriority || PanePriority.Pane1;
  }

  getPaneMode() {
    return this.props.paneMode || PaneMode.Auto;    
  }

  componentDidMount() {
    DualScreenInfo.addEventListener('didUpdateSpanning', this._handleSpanningChanged);
  }

  componentWillUnmount() {
    DualScreenInfo.removeEventListener('didUpdateSpanning', this._handleSpanningChanged);
  }

  private _handleSpanningChanged = (update: DualScreenInfoPayload) => {
    this.setState({
      spanning: update.isSpanning,
      orientation: update.orientation       
    });
  };

  render() {    
    return (
      <View style={this.isHorizontalOrientation() ? styles.flexRow : styles.flexColumn}>
        {this.renderChildPanes()}
      </View>
    );
  }

  renderChildPanes() {
    const children = React.Children.toArray(this.props.children);

    const paneMode = this.getPaneMode();
    switch (paneMode) {
      case PaneMode.Auto:
        // TODO:  add logic for auto-detecting width > threshold
        if (this.state.spanning) {
          return this.renderBothPanes();
        }
        return this.renderPaneWithPriority();
      case PaneMode.Single:
        return this.renderPaneWithPriority();
      case PaneMode.Double:
        return this.renderBothPanes();
    }
  }

  renderPaneWithPriority() {
    if (this.getPanePriority() === PanePriority.Pane1) {
      return this.renderPane1();
    }
    else {
      return this.renderPane2();
    }
  }
  
  renderBothPanes() {
    const children = React.Children.toArray(this.props.children);

    const items = [];
    items.push(this.renderPane1());
    if (this.state.spanning) {
      items.push(this.renderSeparator());
    }
    items.push(this.renderPane2());

    return items;
  }

  renderPane1() {
    const children = React.Children.toArray(this.props.children);
    return (
      <View key={PanePriority.Pane1} style={styles.flexOne}>
        {children.length > 0 ? children[0] : null}
      </View>
    );
  }

  renderPane2() {
    const children = React.Children.toArray(this.props.children);
    return (
      <View key={PanePriority.Pane2} style={styles.flexOne}>
        {children.length > 1 ? children[1] : null}
      </View>
    );
  }

  renderSeparator() {
    // TODO - render Hinge
    let horizontal = this.isHorizontalOrientation();
    let separatorWidth = horizontal ? DualScreenInfo.hingeWidth: '100%';
    let separatorHeight = horizontal ? '100%' : DualScreenInfo.hingeWidth;
    return (
      <View
        key="separator"
        style={{width: separatorWidth, height: separatorHeight}}
      />
    );
  }

  isHorizontalOrientation() {
    return (this.state.orientation === DeviceOrientation.Portrait || this.state.orientation === DeviceOrientation.PortraitFlipped);
  }
}

const styles = StyleSheet.create({
  flexRow: {
    flexDirection: 'row',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  flexOne: {
    flex: 1,
  }
});
