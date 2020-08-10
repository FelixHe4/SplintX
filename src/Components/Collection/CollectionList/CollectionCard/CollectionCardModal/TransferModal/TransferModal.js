import React from 'react';
import './TransferModal.css';
import ActionProgress from '../ActionProgress/ActionProgress';
import $ from 'jquery';

class TransferModal extends React.Component {
	constructor(props) {
		super(props);
		this.transfer = this.transfer.bind(this);
		this.state = {
			renderProgress: false,
			progressMsg: ''
		};
	}

	transfer() {
		this.setState({
			renderProgress: true,
			progressMsg: 'Broadcasting request to the blockchain.'
		});
		let receive = document.getElementById('transferAct-input').value;
		if (receive !== '') {
			let selected = this.props.cards.map(card => {return card.uid});
			let transferJSON = JSON.stringify({
				to: receive,
				cards: selected,			
				app: 'steemmonsters/0.7.34'
			});
			window.hive_keychain.requestCustomJson(localStorage.getItem('username'), 'sm_gift_cards', 'Active', transferJSON, 'Transfer Card(s)', function(response) {
				if (response.success) {
					this.setState({progressMsg: 'Step 1 of 2 complete - Request successfully broadcasted'}, () => {
						setTimeout(() => {
							this.setState({progressMsg: 'Gathering request results.'});
						}, 2000);
					});
					let id = response.result.id;
					let url = 'https://game-api.splinterlands.io/transactions/lookup?trx_id=' + id;
					setTimeout(() => {
						$.ajax({
							type: 'GET',
				  			url: url,
				  			jsonpCallback: 'testing',
				  			dataType: 'json',
							success: function(response) { 
								console.log(response.error)
								if (response.error) {
									this.setState({renderProgress: false});
									let toast = document.getElementById('cardsFailed-toast');
									toast.innerHTML = '<i class=\'fas fa-times\'></i> There was an error: ' + response.error;
									toast.className += ' show';
									setTimeout(() => {toast.className = toast.className.replace(' show', '')}, 3000);
								} else {
									this.setState({renderProgress: false});
									this.props.updateCollection('remove', selected);
									let toast = document.getElementById('cardsTransferred-toast');
									toast.className += ' show';
									setTimeout(() => {
										toast.className = toast.className.replace(' show', '');
										this.props.closeModal();
										this.props.closeParentModal();
									}, 3000);
								}
							}.bind(this),
							error: function(e) {
								console.log('Something went wrong');
							}
						});
					}, 10000);
					
				} else {					
					this.setState({renderProgress: false});
					let toast = document.getElementById('cardsFailed-toast');
					toast.innerHTML = '<i class=\'fas fa-times\'></i> There was an error broadcasting to the blockchain.';
					toast.className += ' show';
					setTimeout(() => {toast.className = toast.className.replace(' show', '')}, 3000);
				}
			}.bind(this));
		} else {
			let toast = document.getElementById('noAddress-toast');
			toast.className += ' show';
			setTimeout(() => {toast.className = toast.className.replace(' show', '')}, 3000);
		}
	}

	render() {
		return(
			<div className='modal'>
				<div className='modal-overlay' onClick={this.props.closeModal}></div>
				<div className='mini modal-content'>
					<div className='modal-exit' onClick={this.props.closeModal}><i className='fas fa-times'></i></div>
					<h2>Transfer Cards</h2>
					<p>Transfer <strong>{this.props.cards.length} {this.props.info.gold ? 'Gold' : ''} {this.props.info.name} Card{this.props.cards.length > 1 ? 's' : ''}</strong></p>
					<div className='transferAct'>
						Transfer to: <input placeholder='Account Name' id='transferAct-input'/>
					</div>
					<div>
						<button className='modal-action-btn' onClick={this.transfer}>Transfer</button>
					</div>
				</div>
				<div id='cardsTransferred-toast' className='toast successToast'>
					<i className='fas fa-check'></i>Successfully transferred!
				</div>
				<div id='cardsFailed-toast' className='toast failToast'>
					<i className='fas fa-times'></i>Something went wrong! Please try again.
				</div>
				<div id='noAddress-toast' className='toast failToast'>
					<i className='fas fa-times'></i>Please enter a receiving account.
				</div>
				{this.state.renderProgress ? <ActionProgress action='Transferring' message={this.state.progressMsg} /> : '' }
			</div>
		);
	}
}

export default TransferModal;