from datetime import datetime
import numpy

def readFile(fname):
	f = open(fname, 'r')
	lines = f.readlines()
	f.close

	data = []
	for l in lines:
		datum = {}
		attrs = l.split(',')
		date = attrs[3]
		value = attrs[4]
		try:
			tmp = int(date)
			value = float(value)
		except:
			continue
		else:
			datum['date'] = datetime.strptime(date, "%Y%m%d0000")
			datum['value'] = value
			data.append(datum)
	return data

def getMonthAvgs(data):
	monthMeans = []
	for month in range(1,13):
		monthData = [d['value'] for d in data if d['date'].month == month]
		monthMeans.append(numpy.mean(monthData))
	return monthMeans

def getTotalAvg(data):
	overallMean = numpy.mean([d['value'] for d in data])
	return overallMean

def normalise(data, avg, monthavgs):
	for d in data:
		print monthavgs, d['date'].month
		monthAvg = monthavgs[d['date'].month - 1]
		d['value'] += (avg - monthAvg)
	return data

def writeFile(data, fname):
	f = open(fname, 'w')
	f.write('Datetime,Value\n')
	for d in data:
		f.write('%s,%f\n'%(datetime.strftime(d['date'], "%Y%m%d0000"), d['value']))
	f.close()

def modifyData(infile):
	outfile = infile[:-4] + '_norm.csv'
	data = readFile(infile)
	ndata = normalise(data, getTotalAvg(data), getMonthAvgs(data))
	writeFile(ndata, outfile)

modifyData('Met_Office-Anl.csv')
modifyData('ECMWF_EC-Anl.csv')
modifyData('JMA_JA-Anl.csv')
modifyData('DWD_GE-Anl.csv')
