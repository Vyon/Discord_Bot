/*

Gets the time and date and puts all the info into an array

*/

module.exports = {
	getTime() {
		const dateArr = Date(Date.now()).toLocaleString().split(' ', 5)
		const timeArr = dateArr[4].split(':')
		let weekday = dateArr[0]
		let month = dateArr[1]
		let day = dateArr[2]
		let year = dateArr[3]
		let hour = timeArr[0]
		let minute = timeArr[1]
		let second = timeArr[2]
		let tof = 'AM'

		if (hour > 12) {
			hour = hour % 12
			tof = 'PM'
		} else if (hour == 0) {
			hour = 12
			tof = 'AM'
		} else {
			if (hour.split()[1] < 10) {
				hour = hour.split('0')[1]
			}
			tof = 'AM'
		}

		switch (month) {
			case 'Jan':
				month = 1
				break
			case 'Feb':
				month = 2
				break
			case 'Mar':
				month = 3
				break
			case 'Apr':
				month = 4
				break
			case 'May':
				month = 5
				break
			case 'Jun':
				month = 6
				break
			case 'Jul':
				month = 7
				break
			case 'Aug':
				month = 8
				break
			case 'Sept':
				month = 9
				break
			case 'Oct':
				month = 10
				break
			case 'Nov':
				month = 11
				break
			case 'Dec':
				month = 12
				break
		}
		return {'weekday': weekday, 'month': month, 'day': day, 'year': year, 'hour': hour, 'minute': minute, 'second': second, 'typography': tof}
	}
}